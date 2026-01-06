export interface FeedbackItem {
  id: string;
  title: string;
  message: string;
  reply: string | null;
  status: 'PENDING' | 'REPLIED'; // Hoặc string nếu chưa có enum
  createdAt: Date | string;
}

export interface SendFeedbackInput {
  title: string;
  message: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data?: FeedbackItem[];
}