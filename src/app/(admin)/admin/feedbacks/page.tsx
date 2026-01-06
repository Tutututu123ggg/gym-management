import { Metadata } from 'next';
import FeedbackManager from '@/components/admin/feedbacks/FeedbackManager';

export const metadata: Metadata = {
  title: 'Quản Lý Phản Hồi | Admin Dashboard',
  description: 'Tiếp nhận ý kiến đóng góp và khiếu nại của hội viên.',
};

export default function AdminFeedbackPage() {
  return (
    <div className="w-full h-full p-6">
      <FeedbackManager userRole="ADMIN" />
    </div>
  );
}