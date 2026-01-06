import { Prisma } from '@prisma/client';

// Định nghĩa Type dữ liệu trả về (bao gồm thông tin User)
export type FeedbackWithUser = Prisma.FeedbackGetPayload<{
  include: {
    user: {
      select: { name: true; email: true; avatar: true };
    };
  };
}>;

export type FeedbackFilterStatus = 'ALL' | 'PENDING' | 'REPLIED';

export interface PaginationMetadata {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
  data?: FeedbackWithUser[];
  metadata?: PaginationMetadata;
}