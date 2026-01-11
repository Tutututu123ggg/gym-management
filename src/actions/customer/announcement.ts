"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { protect } from '@/lib/auth-guard'; // [NEW]

// Tạo thông báo mới
export async function createAnnouncement(userId: string, title: string, content: string) {
  try {
    const user = await protect(['ADMIN', 'STAFF']); // 🔒

    // [Optional] Đảm bảo người tạo là người đang login
    if (user.id !== userId) return { success: false, message: "Không đúng thông tin người gửi" };

    await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: user.id, // Dùng ID thật từ token cho an toàn
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
    await protect(['ADMIN', 'STAFF']); // 🔒

    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/admin/dashboard");
    revalidatePath("/staff/home");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}