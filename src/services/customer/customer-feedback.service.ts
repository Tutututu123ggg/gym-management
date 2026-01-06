import { PrismaClient } from '@prisma/client';
import { SendFeedbackInput } from '@/types/customer/customer-feedback';

export class CustomerFeedbackService {
  constructor(private db: PrismaClient) {}

  // Gửi phản hồi mới
  async create(userId: string, data: SendFeedbackInput) {
    return await this.db.feedback.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        status: 'PENDING'
      }
    });
  }

  // Lấy lịch sử phản hồi của user
  async getByUserId(userId: string) {
    return await this.db.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}