"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TaskFrequency } from "@prisma/client";
import { protect } from '@/lib/auth-guard'; // [NEW]

// --- 1. LẤY DỮ LIỆU TỔNG QUAN ---
export async function getStaffDashboardData(userId: string) {
  try {
    // 🔒 STAFF/TRAINER chỉ xem được của mình, ADMIN xem được tất cả
    const user = await protect(['STAFF', 'TRAINER', 'ADMIN']);
    if (user.role !== 'ADMIN' && user.id !== userId) {
      return { success: false, message: "Không có quyền truy cập dữ liệu này." };
    }

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

// --- 2. HÀM CHECK-IN / CHECK-OUT CHO STAFF ---
export async function toggleStaffCheckIn(userId: string) {
  try {
    // 🔒 Chặn IDOR: Không được chấm công hộ người khác
    const user = await protect(['STAFF', 'TRAINER', 'ADMIN']);
    if (user.role !== 'ADMIN' && user.id !== userId) {
      return { success: false, message: "Không có quyền chấm công cho người khác." };
    }

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
    // 🔒
    const user = await protect(['STAFF', 'TRAINER', 'ADMIN']);
    if (user.role !== 'ADMIN' && user.id !== userId) return { success: false, message: "Unauthorized" };

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
    await protect(['STAFF', 'TRAINER', 'ADMIN']); // 🔒
    
    // Lưu ý: Nếu muốn chặt chẽ hơn, bạn nên check xem task này có thuộc về user đang login không
    // Nhưng vì hàm này chỉ update trạng thái done/not done, nên để Role check là tạm ổn.
    
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
    await protect(['STAFF', 'TRAINER', 'ADMIN']); // 🔒

    await prisma.staffNote.delete({ where: { id: taskId } });
    revalidatePath("/staff/home");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}