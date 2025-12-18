"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 1. Lấy danh sách lớp theo gói (Plan)
 *    👉 KHÔNG dùng Prisma.GetPayload để tránh lỗi build trên Vercel
 */
export async function getGymClassesByPlan(planId: string) {
  try {
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

/**
 * 2. Type an toàn – suy ra trực tiếp từ function
 *    👉 Không phụ thuộc Prisma Client generate
 */
export type GymClassWithStats =
  Awaited<ReturnType<typeof getGymClassesByPlan>>["data"][number];

/**
 * 3. Tạo lớp mới
 */
export async function createGymClass(planId: string, name: string) {
  try {
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

/**
 * 4. Xóa lớp
 */
export async function deleteGymClass(classId: string) {
  try {
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
