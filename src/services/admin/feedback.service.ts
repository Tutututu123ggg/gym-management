import { PrismaClient, Prisma } from '@prisma/client';
import { FeedbackFilterStatus } from '@/types/admin/feedback';

export class FeedbackService {
  private db: PrismaClient;

  // DEPENDENCY INJECTION: Nhận DB từ bên ngoài (Constructor Injection)
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async getAll(filter: FeedbackFilterStatus, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.FeedbackWhereInput = filter !== 'ALL' ? { status: filter } : {};

    const [total, data] = await this.db.$transaction([
      this.db.feedback.count({ where }),
      this.db.feedback.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { total, data };
  }

  async reply(id: string, replyMessage: string) {
    return await this.db.feedback.update({
      where: { id },
      data: {
        reply: replyMessage,
        status: 'REPLIED',
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return await this.db.feedback.delete({ where: { id } });
  }
}