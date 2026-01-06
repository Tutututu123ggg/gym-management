import prisma from "@/lib/prisma";

export class TrainerService {
  // --- 1. DASHBOARD & CHECK-IN ---

  async getDashboardData(userId: string) {
    // A. Check-in status
    const currentSession = await prisma.checkIn.findFirst({
      where: { userId: userId, checkOutAt: null },
      orderBy: { checkInAt: 'desc' },
    });

    // B. Announcements
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // C. Upcoming Classes (Lấy 5 lớp sắp tới để hiện ở Dashboard)
    const upcomingClasses = await prisma.classSession.findMany({
      where: {
        trainerId: userId,
        startTime: { gte: new Date() },
        isCanceled: false,
      },
      include: {
        gymClass: { select: { name: true } },
        room: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    });

    return {
      isCheckedIn: !!currentSession,
      currentSession,
      announcements,
      upcomingClasses
    };
  }

  async toggleCheckIn(userId: string) {
    const currentSession = await prisma.checkIn.findFirst({
      where: { userId: userId, checkOutAt: null },
    });

    if (currentSession) {
      await prisma.checkIn.update({
        where: { id: currentSession.id },
        data: { checkOutAt: new Date() },
      });
      return { status: "CHECKED_OUT", message: "Đã kết thúc ca làm việc!" };
    } else {
      await prisma.checkIn.create({
        data: { userId: userId, checkInAt: new Date() },
      });
      return { status: "CHECKED_IN", message: "Check-in thành công!" };
    }
  }

  // --- 2. QUẢN LÝ LỊCH DẠY (SCHEDULE) ---

  async getUpcomingClasses(userId: string, limit: number = 20, filter: 'upcoming' | 'history' = 'upcoming') {
    const timeCondition = filter === 'upcoming' 
      ? { gte: new Date() }  // Tương lai
      : { lt: new Date() };  // Quá khứ

    const sortOrder = filter === 'upcoming' ? 'asc' : 'desc';

    return await prisma.classSession.findMany({
      where: {
        trainerId: userId,
        startTime: timeCondition,
        isCanceled: false,
      },
      include: {
        gymClass: { select: { name: true } },
        room: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { startTime: sortOrder },
      take: limit,
    });
  }

  // --- 3. QUẢN LÝ HỌC VIÊN (MEMBERS & PROGRESS) ---

  // A. Lấy danh sách các Môn (GymClass) mà Trainer này đang dạy
  async getTrainerCourses(trainerId: string) {
    return await prisma.gymClass.findMany({
      where: {
        sessions: {
          some: { trainerId: trainerId } // Môn nào có ít nhất 1 buổi do HLV này dạy
        }
      },
      select: {
        id: true,
        name: true,
        // Đếm số buổi HLV này đã dạy cho môn này
        _count: {
          select: {
            sessions: { where: { trainerId: trainerId } }
          }
        }
      }
    });
  }

  // B. Lấy danh sách Học viên trong 1 Môn cụ thể (của Trainer này)
  async getStudentsInCourse(trainerId: string, gymClassId: string) {
    return await prisma.user.findMany({
      where: {
        role: 'MEMBER', // Chỉ lấy hội viên
        bookings: {
          some: {
            classSession: {
              trainerId: trainerId,   // Buổi học do HLV này dạy
              gymClassId: gymClassId  // Thuộc môn học này
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        // Lấy chỉ số cơ thể mới nhất
        bodyMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        },
        // Đếm số buổi học viên này đã book môn này với HLV này
        _count: {
          select: {
            bookings: {
              where: {
                classSession: {
                  trainerId: trainerId,
                  gymClassId: gymClassId
                }
              }
            }
          }
        }
      }
    });
  }

  // C. Lấy lịch sử chỉ số cơ thể của 1 học viên (Vẽ biểu đồ)
  async getStudentProgress(studentId: string) {
    return await prisma.bodyMetric.findMany({
      where: { userId: studentId },
      orderBy: { recordedAt: 'asc' }, // Sắp xếp thời gian tăng dần để vẽ Line Chart
      take: 20 // Giới hạn 20 điểm dữ liệu gần nhất
    });
  }
}