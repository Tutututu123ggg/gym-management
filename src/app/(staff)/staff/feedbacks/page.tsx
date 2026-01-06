import { Metadata } from 'next';
import FeedbackManager from '@/components/admin/feedbacks/FeedbackManager';

export const metadata: Metadata = {
  title: 'Hỗ Trợ Khách Hàng | Staff Portal',
  description: 'Nhân viên hỗ trợ trả lời phản hồi của hội viên.',
};

export default function StaffFeedbackPage() {
  return (
    <div className="w-full h-full p-6">
      {/* Staff sẽ không thấy nút Xóa */}
      <FeedbackManager userRole="STAFF" />
    </div>
  );
}