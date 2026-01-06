"use client";

import { useAuth } from '@/context/AuthContext';
import PersonalDashboard, { QuickActionItem } from '@/components/admin/home/PersonalDashboard';
import { Users, CreditCard, BarChart3, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const adminActions: QuickActionItem[] = [
    { label: 'Quản lý Hội viên', href: '/admin/members', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-500' },
    { label: 'Doanh thu', href: '/admin/stats', icon: BarChart3, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-500' },
    { label: 'Quản lý Gói', href: '/admin/plans', icon: CreditCard, color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-500' },
    { label: 'Cấu hình', href: '/admin/settings', icon: Settings, color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-500' },
  ];

  return <PersonalDashboard user={user} quickActions={adminActions} canManageAnnouncements={true} />;
}