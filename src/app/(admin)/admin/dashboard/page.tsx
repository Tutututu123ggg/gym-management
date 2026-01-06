"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

// Import Components
import DashboardFilter from '@/components/admin/dashboard/DashboardFilter';
import DashboardStatsCards from '@/components/admin/dashboard/DashboardStatsCards';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import RecentTransactions from '@/components/admin/dashboard/RecentTransactions';

export default function AdminDashboardPage() {
  // Kết nối với Hook Logic
  const { data, loading, filter, actions } = useAdminDashboard();

  // Loading toàn trang nếu chưa có data lần đầu
  if (loading && !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-slate-50 dark:bg-gray-900 min-h-screen text-slate-900 dark:text-white">
      
      {/* 1. Header Area & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Dashboard Quản Trị</h1>
           <p className="text-sm text-slate-500">Dữ liệu thực tế từ hệ thống.</p>
        </div>
        
        <DashboardFilter 
          year={filter.year} 
          month={filter.month} 
          onYearChange={actions.setYear}
          onMonthChange={actions.setMonth}
        />
      </div>

      {/* 2. Stats Cards */}
      <DashboardStatsCards data={data} />

      {/* 3. Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <RevenueChart 
           data={data} 
           loading={loading} // Truyền loading vào để hiện skeleton/loading state trên chart
           year={filter.year} 
           month={filter.month} 
         />
         <RecentTransactions data={data} />
      </div>
      
    </div>
  );
}