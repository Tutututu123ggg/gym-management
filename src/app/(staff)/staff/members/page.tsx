import { Metadata } from 'next';
import MemberManager from '@/components/admin/members/MemberManager';

export const metadata: Metadata = {
  title: 'Hỗ Trợ Hội Viên | Staff Portal',
  description: 'Nhân viên: Tra cứu thông tin và hỗ trợ đăng ký gói tập.',
};

export default function StaffMembersPage() {
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Staff bị giới hạn quyền (Chỉ xem, Đăng ký, Sửa cơ bản) */}
      <MemberManager userRole="STAFF" />
    </div>
  );
}