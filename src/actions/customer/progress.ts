"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ProgressService } from '@/services/customer/progress.service';
import { protect } from '@/lib/auth-guard'; // [NEW]

const progressService = new ProgressService(prisma);

export async function getDashboardDataAction(userId: string) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Unauthorized" };

    const data = await progressService.getDashboardData(userId);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi tải dữ liệu" };
  }
}

// ... toggleCheckInAction giữ nguyên ...

// [UPDATED] Action thêm lịch nhận thêm recurrence và untilDate
export async function addScheduleAction(userId: string, data: any) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Unauthorized" };

    await progressService.addSchedule(userId, {
        ...data,
        date: new Date(data.date), // Đảm bảo convert string -> Date
        untilDate: data.untilDate ? new Date(data.untilDate) : undefined
    });
    revalidatePath('/dashboard'); // hoặc đường dẫn page của bạn
    return { success: true, message: "Đã thêm lịch thành công" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi thêm lịch" };
  }
}

// ... các action khác giữ nguyên ...
export async function toggleCheckInAction(userId: string) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Unauthorized" };

    const res = await progressService.toggleCheckIn(userId);
    revalidatePath('/dashboard');
    return { success: true, ...res };
  } catch (error) {
    return { success: false, message: "Lỗi check-in/out" };
  }
}

export async function toggleScheduleStatusAction(id: string, status: boolean) {
  try {
    await protect(['MEMBER']); // 🔒
    // Logic check id schedule thuộc về user nên nằm ở Service layer
    await progressService.toggleScheduleStatus(id, status);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addBodyMetricAction(userId: string, height: number, weight: number) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Unauthorized" };

    await progressService.addBodyMetric(userId, height, weight);
    revalidatePath('/dashboard');
    return { success: true, message: "Đã lưu chỉ số" };
  } catch (error) {
    return { success: false, message: "Lỗi lưu chỉ số" };
  }
}