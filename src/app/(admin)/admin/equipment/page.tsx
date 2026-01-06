import { Metadata } from 'next';
import EquipmentManager from '@/components/admin/equipment/EquipmentManager';

export const metadata: Metadata = {
  title: 'Quản Lý Thiết Bị | Admin Dashboard',
  description: 'Quản lý kho thiết bị, kiểm kê và bảo trì.',
};

export default function AdminEquipmentPage() {
  return (
    <div className="w-full p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <EquipmentManager userRole="ADMIN" />
    </div>
  );
}