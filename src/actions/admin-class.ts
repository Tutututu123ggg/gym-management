"use server";

import prisma from '@/lib/prisma';
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Type an toàn
export type GymClassWithStats = Prisma.GymClassGetPayload<{
  include: { _count: { select: { sessions: true } } }
}>;

// 1. Lấy danh sách lớp của 1 gói
export async function getGymClassesByPlan(planId: string) {
  try {
    const classes = await prisma.gymClass.findMany({
      where: { planId },
      include: {
        _count: { select: { sessions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: classes };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// 2. Tạo lớp mới
export async function createGymClass(planId: string, name: string) {
  try {
    await prisma.gymClass.create({
      data: { planId, name, isActive: true }
    });
    revalidatePath('/admin/plans');
    return { success: true, message: "Đã tạo lớp mới!" };
  } catch (error) {
    return { success: false, message: "Lỗi tạo lớp." };
  }
}

// 3. Xóa lớp
export async function deleteGymClass(classId: string) {
  try {
    const futureSessions = await prisma.classSession.count({
      where: { gymClassId: classId, startTime: { gte: new Date() }, isCanceled: false }
    });

    if (futureSessions > 0) {
      return { success: false, message: `Không thể xóa! Lớp này còn ${futureSessions} buổi học sắp tới.` };
    }

    await prisma.gymClass.delete({ where: { id: classId } });
    revalidatePath('/admin/plans');
    return { success: true, message: "Đã xóa lớp." };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống." };
  }
}