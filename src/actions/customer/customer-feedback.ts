"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CustomerFeedbackService } from '@/services/customer/customer-feedback.service';
import { SendFeedbackInput, FeedbackResponse } from '@/types/customer/customer-feedback';

const feedbackService = new CustomerFeedbackService(prisma);

export async function sendFeedbackAction(userId: string, data: SendFeedbackInput): Promise<FeedbackResponse> {
  try {
    if (!data.title || !data.message) {
      return { success: false, message: "Vui lòng nhập đầy đủ tiêu đề và nội dung." };
    }

    await feedbackService.create(userId, data);
    revalidatePath('/feedback'); // Revalidate trang feedback của user
    return { success: true, message: "Gửi phản hồi thành công! Chúng tôi sẽ trả lời sớm nhất." };
  } catch (error) {
    console.error("Lỗi gửi feedback:", error);
    return { success: false, message: "Có lỗi xảy ra, vui lòng thử lại." };
  }
}

export async function getMyFeedbacksAction(userId: string) {
  try {
    const data = await feedbackService.getByUserId(userId);
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}