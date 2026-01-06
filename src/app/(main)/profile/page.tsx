import { Metadata } from 'next';
import UserProfileManager from '@/components/customer/profile/UserProfileManager';

export const metadata: Metadata = {
  title: 'Hồ Sơ Cá Nhân | Gym Master',
  description: 'Quản lý thông tin tài khoản và lịch sử tập luyện của bạn.',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <UserProfileManager />
    </div>
  );
}