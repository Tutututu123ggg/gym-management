"use client";

import { useAuth } from '@/context/AuthContext';
import PersonalDashboard, { QuickActionItem } from '@/components/admin/home/PersonalDashboard';
import { UserPlus, Wrench, Calendar } from 'lucide-react';

export default function StaffHomePage() {
  const { user } = useAuth();

  const staffActions: QuickActionItem[] = [
    { label: 'Đăng ký khách', href: '/staff/members', icon: UserPlus, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-500' },
    { label: 'Báo hỏng', href: '/staff/equipment', icon: Wrench, color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-500' },
    { label: 'Gói tập', href: '/staff/plans', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-500' },
  ];

  return <PersonalDashboard user={user} quickActions={staffActions} canManageAnnouncements={false} />;
}