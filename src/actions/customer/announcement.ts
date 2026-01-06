"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Tạo thông báo mới
export async function createAnnouncement(userId: string, title: string, content: string) {
  try {
    await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: userId,
        isActive: true
      }
    });
    // Revalidate cả 2 đường dẫn admin và staff để cập nhật ngay
    revalidatePath("/admin/dashboard");
    revalidatePath("/staff/home");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Lỗi tạo thông báo" };
  }
}

// Xóa thông báo
export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/admin/dashboard");
    revalidatePath("/staff/home");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}