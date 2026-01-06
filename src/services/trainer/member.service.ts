import prisma from "@/lib/prisma";

export class MemberService {
  
  // 1. Lấy danh sách Lịch học CÓ THỂ ĐĂNG KÝ (Dựa trên gói tập active)
  async getAvailableSessions(userId: string) {
    // A. Lấy tất cả Plan ID mà user đang đăng ký và còn hạn
    const activeSubs = await prisma.subscription.findMany({
      where: {
        userId: userId,
        isActive: true,
        endDate: { gte: new Date() } // Còn hạn
      },
      select: { planId: true }
    });

    const activePlanIds = activeSubs.map(s => s.planId);

    if (activePlanIds.length === 0) return []; // Không có gói tập nào

    // B. Lấy các buổi học trong tương lai thuộc các Plan trên
    const sessions = await prisma.classSession.findMany({
      where: {
        gymClass: {
          planId: { in: activePlanIds } // Chỉ lấy lớp thuộc gói đã mua
        },
        startTime: { gte: new Date() }, // Chỉ lấy tương lai
        isCanceled: false
      },
      include: {
        gymClass: { select: { name: true } },
        room: { select: { name: true } },
        trainer: { select: { name: true } },
        bookings: {
            where: { userId: userId }, // Check xem user này đã book chưa
            select: { id: true }
        },
        _count: { select: { bookings: true } } // Đếm sĩ số hiện tại
      },
      orderBy: { startTime: 'asc' }
    });

    // C. Map lại dữ liệu để FE dễ dùng
    return sessions.map(session => ({
      ...session,
      isBooked: session.bookings.length > 0, // True nếu user đã book
      bookingId: session.bookings[0]?.id || null,
      currentCapacity: session._count.bookings,
      isFull: session._count.bookings >= session.maxCapacity
    }));
  }

  // 2. Đăng ký lớp (Booking)
  async bookClass(userId: string, sessionId: string) {
    // Check lại xem còn chỗ không (Double check)
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { _count: { select: { bookings: true } } }
    });

    if (!session) throw new Error("Lớp học không tồn tại");
    if (session.startTime < new Date()) throw new Error("Lớp học đã diễn ra");
    if (session._count.bookings >= session.maxCapacity) throw new Error("Lớp đã đầy");

    // Tạo booking
    return await prisma.booking.create({
      data: {
        userId: userId,
        classSessionId: sessionId,
        status: 'BOOKED'
      }
    });
  }

  // 3. Hủy đăng ký / Đổi lớp (Cancel Booking)
  async cancelBooking(userId: string, bookingId: string) {
    // Chỉ cho phép hủy booking của chính mình
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.userId !== userId) {
      throw new Error("Booking không hợp lệ");
    }

    // Xóa booking (Hoặc update status thành CANCELLED tùy logic)
    return await prisma.booking.delete({
      where: { id: bookingId }
    });
  }
}