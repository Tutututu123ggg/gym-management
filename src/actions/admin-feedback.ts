'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

// --- 1. STRICT TYPES DEFINITION ---

// Định nghĩa kiểu dữ liệu trả về từ Prisma (kèm User)
// Tip: Dùng Prisma.FeedbackGetPayload để tự động lấy type chuẩn từ schema
export type FeedbackWithUser = Prisma.FeedbackGetPayload<{
  include: {
    user: {
      select: { name: true; email: true; avatar: true }
    }
  }
}>;

// Định nghĩa Response chuẩn cho Client
export interface FeedbackActionResult {
  success: boolean;
  message?: string;
  data?: FeedbackWithUser[];
  metadata?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export type FeedbackFilterStatus = 'ALL' | 'PENDING' | 'REPLIED';

// --- 2. SERVER ACTIONS ---

export async function getFeedbacks(
  filter: FeedbackFilterStatus = 'ALL', 
  page: number = 1, 
  limit: number = 10
): Promise<FeedbackActionResult> {
  try {
    const skip = (page - 1) * limit;
    
    // Xây dựng điều kiện lọc (Where clause)
    const whereCondition: Prisma.FeedbackWhereInput = {};
    if (filter !== 'ALL') {
      whereCondition.status = filter; // "PENDING" | "REPLIED"
    }

    // Transaction: Đếm tổng + Lấy dữ liệu
    const [total, feedbacks] = await prisma.$transaction([
      prisma.feedback.count({ where: whereCondition }),
      prisma.feedback.findMany({
        where: whereCondition,
        include: {
          user: {
            select: { name: true, email: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: feedbacks,
      metadata: { total, totalPages, currentPage: page, limit }
    };

  } catch (error) {
    console.error("Fetch feedback error:", error);
    return { success: false, message: "Không thể tải dữ liệu phản hồi." };
  }
}

export async function replyFeedback(id: string, replyMessage: string): Promise<FeedbackActionResult> {
  try {
    if (!replyMessage.trim()) {
        return { success: false, message: "Nội dung trả lời không được để trống." };
    }

    await prisma.feedback.update({
      where: { id },
      data: {
        reply: replyMessage,
        status: 'REPLIED',
        updatedAt: new Date()
      }
    });
    
    revalidatePath('/admin/feedback');
    return { success: true, message: "Đã gửi câu trả lời thành công!" };
  } catch (error) {
    console.error("Reply feedback error:", error);
    return { success: false, message: "Lỗi khi gửi câu trả lời." };
  }
}

export async function deleteFeedback(id: string): Promise<FeedbackActionResult> {
  try {
    await prisma.feedback.delete({ where: { id } });
    revalidatePath('/admin/feedback');
    return { success: true, message: "Đã xóa phản hồi." };
  } catch (error) {
    console.error("Delete feedback error:", error);
    return { success: false, message: "Lỗi khi xóa phản hồi." };
  }
}