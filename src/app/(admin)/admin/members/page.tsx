import { Metadata } from 'next';
import MemberManager from '@/components/admin/MemberManager'; // Đảm bảo đường dẫn đúng tới file bạn vừa tạo

export const metadata: Metadata = {
  title: 'Quản Lý Hội Viên | Admin Dashboard',
  description: 'Tra cứu thông tin hội viên và đăng ký gói tập tại quầy.',
};

export default function MembersPage() {
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Chúng ta bọc MemberManager vào đây.
        MemberManager là Client Component ("use client") nên nó sẽ xử lý
        các tương tác như Modal, Search, Call API.
      */}
      <MemberManager />
    </div>
  );
}