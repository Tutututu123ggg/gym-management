"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, DollarSign, Activity, TrendingUp, Calendar, Loader2 } from 'lucide-react';
// Import các Interface từ file action của bạn
import { getDashboardStats, DashboardStats, RecentTransaction } from '@/actions/dashboard';

export default function AdminDashboardPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Danh sách năm để chọn (có thể mở rộng logic tự động)
  const years: number[] = [2023, 2024, 2025];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getDashboardStats(year, month);
        setData(res);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [year, month]);

  // Format tiền tệ chuẩn VNĐ
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading && !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-background min-h-screen text-foreground relative">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Dashboard Quản Trị</h1>
           <p className="text-sm text-gray-500">Dữ liệu thực tế từ hệ thống quản lý phòng tập</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-card p-2 rounded-xl border shadow-sm">
          <Calendar size={18} className="text-gray-400 ml-1" />
          
          {/* SELECT NĂM: Thêm dark:text-white */}
          <select 
            value={year} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setYear(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold outline-none cursor-pointer text-gray-900 dark:text-white"
          >
            {years.map((y) => (
                <option key={y} value={y} className="text-black">Năm {y}</option>
            ))}
          </select>

          <div className="h-4 w-[1px] bg-gray-300 mx-1" />

          {/* SELECT THÁNG: Thêm dark:text-white */}
          <select 
            value={month || ""} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-transparent text-sm font-semibold outline-none cursor-pointer text-gray-900 dark:text-white"
          >
            <option value="" className="text-black">Cả năm</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1} className="text-black">Tháng {i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <div className="bg-white dark:bg-card p-6 rounded-2xl border shadow-sm flex flex-col justify-center items-center text-center">
             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full mb-3">
                <Users size={24} />
             </div>
             <p className="text-sm text-gray-500 font-medium">Tổng Hội Viên</p>
             <h3 className="text-3xl font-bold my-1 text-gray-900 dark:text-white">
                {data?.stats.totalMembers.toLocaleString() || 0}
             </h3>
        </div>

        <div className="bg-white dark:bg-card p-6 rounded-2xl border shadow-sm flex flex-col justify-center items-center text-center">
             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full mb-3">
                <Activity size={24} />
             </div>
             <p className="text-sm text-gray-500 font-medium">Thiết bị hoạt động tốt</p>
             <h3 className="text-3xl font-bold my-1 text-gray-900 dark:text-white">
                {data?.stats.activeEquipment || 0}
             </h3>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* CHART */}
         <div className="lg:col-span-2 bg-white dark:bg-card p-6 rounded-2xl border shadow-sm relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                <Loader2 className="animate-spin text-indigo-600" />
              </div>
            )}
            <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
              <DollarSign size={20} className="text-indigo-600"/> 
              Xu hướng doanh thu {month ? `tháng ${month}/${year}` : `năm ${year}`}
            </h3>
            <div className="h-[350px] w-full text-xs">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chartData || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b' }}
                        tickFormatter={(v: number) => `${(v/1000000).toFixed(1)}M`} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#4f46e5" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        strokeWidth={3} 
                        animationDuration={1500}
                      />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* TRANSACTIONS */}
         <div className="bg-white dark:bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[480px]">
            <div className="p-5 border-b flex justify-between items-center">
               <h3 className="font-bold text-lg">Giao dịch gần đây</h3>
               <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold uppercase">Mới nhất</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
               {data?.recentTransactions.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-gray-400 text-sm">Không có giao dịch nào</div>
               ) : (
                 data?.recentTransactions.map((t: RecentTransaction) => (
                    <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all group">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-200 group-hover:scale-110 transition-transform">
                             {t.user.name?.charAt(0) || "U"}
                          </div>
                          <div>
                             <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{t.user.name || "N/A"}</p>
                             <p className="text-xs text-gray-500">{t.subscription.plan.name}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-sm text-indigo-600">{t.amount.toLocaleString()} đ</p>
                          <p className="text-[10px] text-gray-400 font-medium">{format(new Date(t.createdAt), 'dd/MM HH:mm')}</p>
                       </div>
                    </div>
                 ))
               )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50">
               <button className="w-full py-2.5 text-xs font-bold text-indigo-600 bg-white dark:bg-card border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                 Xem báo cáo chi tiết
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
