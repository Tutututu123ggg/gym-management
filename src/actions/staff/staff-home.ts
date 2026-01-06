"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TaskFrequency } from "@prisma/client";

// --- 1. LẤY DỮ LIỆU TỔNG QUAN ---
export async function getStaffDashboardData(userId: string) {
  try {
    // A. Check-in (Kiểm tra xem đang vào ca hay chưa)
    const currentSession = await prisma.checkIn.findFirst({
      where: { userId: userId, checkOutAt: null },
      orderBy: { checkInAt: 'desc' },
    });

    // B. Lấy Thông báo (Announcement)
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // C. Lấy Task cá nhân (StaffNote)
    const myTasks = await prisma.staffNote.findMany({
      where: { userId: userId },
      orderBy: [
        { isDone: 'asc' }, 
        { createdAt: 'desc' }
      ]
    });

    return {
      success: true,
      data: {
        isCheckedIn: !!currentSession,
        currentSession,
        announcements,
        myTasks
      }
    };

  } catch (error) {
    console.error("Error fetching staff dashboard:", error);
    return { success: false, message: "Lỗi server" };
  }
}

// --- 2. HÀM CHECK-IN / CHECK-OUT CHO STAFF (Cái bạn đang thiếu) ---
export async function toggleStaffCheckIn(userId: string) {
  try {
    // Kiểm tra xem nhân viên này có đang check-in dở không
    const currentSession = await prisma.checkIn.findFirst({
      where: {
        userId: userId,
        checkOutAt: null,
      },
    });

    if (currentSession) {
      // --> Đang trong ca => Thực hiện CHECK-OUT
      await prisma.checkIn.update({
        where: { id: currentSession.id },
        data: {
          checkOutAt: new Date(),
        },
      });
      
      // Tính toán tổng giờ làm (nếu cần cộng dồn KPI thì làm ở đây)
      // const durationHours = (new Date().getTime() - currentSession.checkInAt.getTime()) / (1000 * 60 * 60);
      // await updateStaffKPI(userId, durationHours);

      revalidatePath("/staff/home");
      return { success: true, status: "CHECKED_OUT", message: "Đã kết thúc ca làm việc!" };
    } else {
      // --> Chưa vào ca => Thực hiện CHECK-IN
      await prisma.checkIn.create({
        data: {
          userId: userId,
          checkInAt: new Date(),
        },
      });
      revalidatePath("/staff/home");
      return { success: true, status: "CHECKED_IN", message: "Chấm công vào ca thành công!" };
    }

  } catch (error) {
    console.error("Lỗi chấm công:", error);
    return { success: false, message: "Lỗi hệ thống chấm công" };
  }
}

// --- 3. CÁC HÀM QUẢN LÝ TASK (STAFF NOTE) ---

export async function createStaffTask(userId: string, content: string, frequency: TaskFrequency) {
  try {
    await prisma.staffNote.create({
      data: { userId, content, frequency }
    });
    revalidatePath("/staff/home");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Lỗi tạo task" };
  }
}

export async function toggleStaffTask(taskId: string, currentStatus: boolean) {
  try {
    await prisma.staffNote.update({
      where: { id: taskId },
      data: { isDone: !currentStatus }
    });
    revalidatePath("/staff/home");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteStaffTask(taskId: string) {
  try {
    await prisma.staffNote.delete({ where: { id: taskId } });
    revalidatePath("/staff/home");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}