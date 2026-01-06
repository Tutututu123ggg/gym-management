'use server';

import prisma from '@/lib/prisma'; // Singleton thật được import ở đây
import { revalidatePath } from 'next/cache';
import { FeedbackService } from '@/services/admin/feedback.service';
import { FeedbackFilterStatus, FeedbackResponse } from '@/types/admin/feedback';

// "WIRING": Khởi tạo Service với Dependency cụ thể
const feedbackService = new FeedbackService(prisma);

export async function getFeedbacks(
  filter: FeedbackFilterStatus = 'ALL',
  page: number = 1
): Promise<FeedbackResponse> {
  try {
    const limit = 10;
    const result = await feedbackService.getAll(filter, page, limit);

    return {
      success: true,
      data: result.data,
      metadata: {
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    console.error('Get Feedbacks Error:', error);
    return { success: false, message: 'Lỗi khi tải dữ liệu.' };
  }
}

export async function replyFeedback(id: string, replyText: string): Promise<FeedbackResponse> {
  if (!replyText.trim()) {
    return { success: false, message: 'Nội dung trả lời không được để trống.' };
  }
  try {
    await feedbackService.reply(id, replyText);
    revalidatePath('/admin/feedback'); // Framework specific logic ở Action
    return { success: true, message: 'Đã gửi câu trả lời thành công!' };
  } catch (error) {
    console.error('Reply Feedback Error:', error);
    return { success: false, message: 'Lỗi khi gửi câu trả lời.' };
  }
}

export async function deleteFeedback(id: string): Promise<FeedbackResponse> {
  try {
    await feedbackService.delete(id);
    revalidatePath('/admin/feedback');
    return { success: true, message: 'Đã xóa phản hồi.' };
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    return { success: false, message: 'Lỗi khi xóa phản hồi.' };
  }
}