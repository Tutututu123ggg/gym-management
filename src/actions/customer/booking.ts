"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Lấy danh sách các buổi học sắp tới của một Plan
export async function getPlanSessions(planId: string) {
  try {
    const sessions = await prisma.classSession.findMany({
      where: {
        gymClass: {
          planId: planId, // Chỉ lấy buổi học thuộc Plan này
          isActive: true
        },
        startTime: {
          gte: new Date() // Chỉ lấy buổi chưa diễn ra
        },
        isCanceled: false
      },
      include: {
        gymClass: true,
        trainer: { select: { name: true } }, // Lấy tên HLV
        room: { select: { name: true } },    // Lấy tên phòng
        _count: {
          select: { bookings: true } // Đếm số người đã đặt
        }
      },
      orderBy: { startTime: 'asc' },
      take: 20 // Lấy 20 buổi sắp tới
    });

    // Map lại dữ liệu để dễ dùng ở FE
    return sessions.map(s => ({
      ...s,
      currentBookings: s._count.bookings,
      isFull: s._count.bookings >= s.maxCapacity
    }));
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

// Thực hiện đặt chỗ
export async function bookSession(userId: string, sessionId: string) {
  try {
    // 1. Kiểm tra xem user có gói Active cho buổi học này không
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { gymClass: true }
    });

    if (!session) throw new Error("Buổi học không tồn tại");

    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId,
        planId: session.gymClass.planId,
        isActive: true,
        endDate: { gte: new Date() } // Gói phải còn hạn
      }
    });

    if (!activeSub) throw new Error("Bạn chưa đăng ký gói dịch vụ này hoặc gói đã hết hạn.");

    // 2. Kiểm tra slot
    const bookingCount = await prisma.booking.count({ where: { classSessionId: sessionId } });
    if (bookingCount >= session.maxCapacity) throw new Error("Lớp đã đầy.");

    // 3. Tạo Booking
    await prisma.booking.create({
      data: {
        userId,
        classSessionId: sessionId,
        status: 'BOOKED'
      }
    });

    revalidatePath('/billing');
    return { success: true, message: "Đăng ký lớp thành công!" };
  } catch (error: any) {
    // Bắt lỗi unique constraint (đã book rồi)
    if (error.code === 'P2002') {
        return { success: false, message: "Bạn đã đăng ký buổi học này rồi." };
    }
    return { success: false, message: error.message || "Lỗi đặt lịch" };
  }
}