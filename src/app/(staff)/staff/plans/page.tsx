import { Metadata } from 'next';
import PlansManager from '@/components/admin/plans/PlansManager';

export const metadata: Metadata = {
  title: 'Tra Cứu Dịch Vụ | Staff Portal',
  description: 'Tra cứu giá gói tập và lịch lớp học để tư vấn hội viên.',
};

export default function StaffPlansPage() {
  return (
    <div className="w-full p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PlansManager userRole="STAFF" />
    </div>
  );
}