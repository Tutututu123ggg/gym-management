import { Metadata } from 'next';
import PlansManager from '@/components/admin/plans/PlansManager';

export const metadata: Metadata = {
  title: 'Quản Lý Gói Tập & Dịch Vụ | Admin Dashboard',
  description: 'Thiết lập gói Membership, Lớp học và Lịch biểu.',
};

export default function AdminPlansPage() {
  return (
    <div className="w-full p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PlansManager userRole="ADMIN" />
    </div>
  );
}