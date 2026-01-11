"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { protect } from '@/lib/auth-guard'; // [NEW]

export async function getGymClassesByPlan(planId: string) {
  try {
    await protect(['ADMIN', 'STAFF']); // 🔒

    const classes = await prisma.gymClass.findMany({
      where: { planId },
      include: {
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: classes };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export type GymClassWithStats =
  Awaited<ReturnType<typeof getGymClassesByPlan>>["data"][number];

export async function createGymClass(planId: string, name: string) {
  try {
    await protect(['ADMIN']); // 🔒 CHỈ ADMIN

    await prisma.gymClass.create({
      data: {
        planId,
        name,
        isActive: true,
      },
    });

    revalidatePath("/admin/plans");
    return { success: true, message: "Đã tạo lớp mới!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi tạo lớp." };
  }
}

export async function deleteGymClass(classId: string) {
  try {
    await protect(['ADMIN']); // 🔒 CHỈ ADMIN

    const futureSessions = await prisma.classSession.count({
      where: {
        gymClassId: classId,
        startTime: { gte: new Date() },
        isCanceled: false,
      },
    });

    if (futureSessions > 0) {
      return {
        success: false,
        message: `Không thể xóa! Lớp này còn ${futureSessions} buổi học sắp tới.`,
      };
    }

    await prisma.gymClass.delete({
      where: { id: classId },
    });

    revalidatePath("/admin/plans");
    return { success: true, message: "Đã xóa lớp." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi hệ thống." };
  }
}