import { Metadata } from 'next';
import MemberManager from '@/components/admin/members/MemberManager';

export const metadata: Metadata = {
  title: 'Quản Lý Hội Viên | Admin Dashboard',
  description: 'Quản trị viên: Tra cứu, thêm sửa xóa và quản lý mật khẩu hội viên.',
};

export default function AdminMembersPage() {
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Admin được toàn quyền (Xóa, Đổi pass, ...) */}
      <MemberManager userRole="ADMIN" />
    </div>
  );
}