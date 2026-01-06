import { PrismaClient } from '@prisma/client';
import { DashboardData, Schedule } from '@/types/customer/progress';

interface AddScheduleData {
  title: string;
  date: string | Date; // Ngày bắt đầu (kèm giờ)
  type: 'SELF_PRACTICE' | 'WITH_TRAINER';
  trainerName?: string;
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'; // Kiểu lặp
  untilDate?: string | Date; // Lặp đến ngày nào
}

export class ProgressService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardData(userId: string): Promise<DashboardData | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: { where: { isActive: true }, include: { plan: true }, take: 1 },
        bodyMetrics: { orderBy: { recordedAt: 'asc' }, take: 30 }
      }
    });

    if (!user) return null;

    const history = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { checkInAt: 'desc' },
      take: 7
    });

    const currentSession = await this.prisma.checkIn.findFirst({
      where: { userId, checkOutAt: null }
    });

    // [FIX 1] Lấy lịch từ quá khứ xa (1970) để hiển thị toàn bộ lịch sử
    const startTimeQuery = new Date(0); 

    // 4a. Lịch tự tập
    const selfSchedules = await this.prisma.workoutSchedule.findMany({
      where: { 
        userId,
        date: { gte: startTimeQuery } 
      },
      orderBy: { date: 'asc' }
    });

    // 4b. Lịch lớp đã đăng ký (Booking)
    const classBookings = await this.prisma.booking.findMany({
      where: {
        userId,
        classSession: {
          startTime: { gte: startTimeQuery },
          // isCanceled: false // Bỏ comment nếu muốn ẩn lớp hủy
        }
      },
      include: {
        classSession: {
          include: { gymClass: true, room: true, trainer: true }
        }
      },
      orderBy: { classSession: { startTime: 'asc' } }
    });

    // Map dữ liệu
    const mappedSelf: Schedule[] = selfSchedules.map(s => ({
      id: s.id,
      title: s.title,
      date: s.date,
      type: s.type, 
      trainerName: s.trainerName || undefined,
      isCompleted: s.isCompleted,
      isClass: false
    }));

    const mappedClasses: Schedule[] = classBookings.map(b => ({
      id: b.id,
      title: b.classSession.gymClass.name,
      date: b.classSession.startTime,
      type: 'WITH_TRAINER',
      trainerName: b.classSession.trainer?.name || 'HLV',
      room: b.classSession.room?.name,
      isCompleted: b.status === 'CHECKED_IN', 
      isClass: true 
    }));

    const combinedSchedules = [...mappedSelf, ...mappedClasses].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      stats: {
        totalHours: user.totalHours,
        totalCheckIns: user.totalCheckIns,
        currentStreak: user.currentStreak
      },
      plan: user.subscriptions[0]?.plan || null,
      subscription: user.subscriptions[0] || null,
      isWorkingOut: !!currentSession,
      history,
      schedules: combinedSchedules,
      metrics: user.bodyMetrics
    };
  }

  // [FIX 2] Logic tạo lịch lặp lại
  async addSchedule(userId: string, data: AddScheduleData) {
    const { title, type, trainerName, recurrence, untilDate } = data;
    const startDate = new Date(data.date);
    const endDate = untilDate ? new Date(untilDate) : startDate; // Nếu ko chọn ngày kết thúc thì chỉ tạo 1 lần

    const schedulesToCreate = [];
    let currentDate = new Date(startDate);

    // Vòng lặp tạo lịch
    while (currentDate <= endDate) {
        schedulesToCreate.push({
            userId,
            title,
            date: new Date(currentDate), // Copy ngày
            type,
            trainerName
        });

        // Tăng ngày dựa trên kiểu lặp
        if (!recurrence || recurrence === 'NONE') break; // Chạy 1 lần rồi thoát
        
        if (recurrence === 'DAILY') {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (recurrence === 'WEEKLY') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (recurrence === 'MONTHLY') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Safety break: Tránh lặp vô hạn nếu lỗi logic, giới hạn 1 năm
        if (currentDate.getTime() - startDate.getTime() > 365 * 24 * 60 * 60 * 1000) break;
    }

    // Sử dụng createMany để insert nhiều bản ghi cùng lúc (hiệu năng cao)
    return await this.prisma.workoutSchedule.createMany({
        data: schedulesToCreate
    });
  }

  // ... (Các hàm toggleCheckIn, toggleScheduleStatus, addBodyMetric giữ nguyên như cũ)
  async toggleCheckIn(userId: string) {
    const activeSession = await this.prisma.checkIn.findFirst({ where: { userId, checkOutAt: null } });
    if (activeSession) {
      const checkOutTime = new Date();
      const durationHours = (checkOutTime.getTime() - activeSession.checkInAt.getTime()) / (1000 * 60 * 60);
      await this.prisma.checkIn.update({ where: { id: activeSession.id }, data: { checkOutAt: checkOutTime } });
      await this.prisma.user.update({ where: { id: userId }, data: { totalCheckIns: { increment: 1 }, totalHours: { increment: durationHours } } });
      return { message: "Check-out thành công!" };
    } else {
      await this.prisma.checkIn.create({ data: { userId } });
      return { message: "Check-in thành công!" };
    }
  }

  async toggleScheduleStatus(id: string, status: boolean) {
    return await this.prisma.workoutSchedule.update({ where: { id }, data: { isCompleted: status } });
  }

  async addBodyMetric(userId: string, height: number, weight: number) {
    const heightM = height / 100;
    const bmi = parseFloat((weight / (heightM * heightM)).toFixed(2));
    return await this.prisma.bodyMetric.create({ data: { userId, height, weight, bmi } });
  }
}