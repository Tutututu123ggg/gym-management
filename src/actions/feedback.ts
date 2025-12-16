'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// 1. Gửi phản hồi mới
export async function sendFeedback(userId: string, data: { title: string, message: string }) {
  try {
    if (!data.title || !data.message) {
      return { success: false, message: "Vui lòng nhập đầy đủ tiêu đề và nội dung." };
    }

    await prisma.feedback.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        status: 'PENDING'
      }
    });

    revalidatePath('/feedback');
    return { success: true, message: "Gửi phản hồi thành công! Chúng tôi sẽ trả lời sớm nhất." };
  } catch (error) {
    console.error("Lỗi gửi feedback:", error);
    return { success: false, message: "Có lỗi xảy ra, vui lòng thử lại." };
  }
}

// 2. Lấy lịch sử phản hồi của User
export async function getMyFeedbacks(userId: string) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return feedbacks;
  } catch (error) {
    return [];
  }
}