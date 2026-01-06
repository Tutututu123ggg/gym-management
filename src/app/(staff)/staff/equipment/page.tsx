import { Metadata } from 'next';
import EquipmentManager from '@/components/admin/equipment/EquipmentManager';

export const metadata: Metadata = {
  title: 'Thiết Bị & Cơ Sở Vật Chất | Staff Portal',
  description: 'Tra cứu trạng thái thiết bị và báo hỏng.',
};

export default function StaffEquipmentPage() {
  return (
    <div className="w-full p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <EquipmentManager userRole="STAFF" />
    </div>
  );
}