import React from 'react';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { DashboardStats } from '@/types/admin/dashboard';
import { formatCurrency } from '@/lib/formatters';

interface Props {
  data: DashboardStats | null;
}

export default function DashboardStatsCards({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Doanh thu (Highlight) */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
              <TrendingUp size={140} />
           </div>
           <div className="relative z-10">
              <h2 className="text-lg font-medium opacity-90">Doanh thu kỳ này</h2>
              <h1 className="text-4xl font-black mt-2">
                {data ? formatCurrency(data.stats.revenue) : '0 đ'}
              </h1>
              <div className="mt-6 flex gap-4">
                 <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
                    <p className="text-xs opacity-80 uppercase tracking-wider">Check-in hôm nay</p>
                    <p className="font-bold text-xl">{data?.stats.todayCheckIns || 0}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Card 2: Hội viên */}
        <StatCard 
          icon={Users} 
          colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
          label="Tổng Hội Viên"
          value={data?.stats.totalMembers}
        />

        {/* Card 3: Thiết bị */}
        <StatCard 
          icon={Activity} 
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
          label="Thiết bị tốt"
          value={data?.stats.activeEquipment}
        />
    </div>
  );
}

// Sub-component nội bộ để tái sử dụng
function StatCard({ icon: Icon, colorClass, label, value }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
         <div className={`p-3 rounded-full mb-3 ${colorClass}`}>
            <Icon size={24} />
         </div>
         <p className="text-sm text-slate-500 font-medium">{label}</p>
         <h3 className="text-3xl font-bold my-1 text-slate-900 dark:text-white">
            {value?.toLocaleString() || 0}
         </h3>
    </div>
  );
}