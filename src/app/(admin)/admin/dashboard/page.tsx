"use client";

import React from 'react';
import { format } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  // Mock Data (Thay thế bằng API sau này)
  const revenueData = [
    { name: 'T2', amount: 1200000 },
    { name: 'T3', amount: 2100000 },
    { name: 'T4', amount: 800000 },
    { name: 'T5', amount: 1600000 },
    { name: 'T6', amount: 2500000 },
    { name: 'T7', amount: 3200000 },
    { name: 'CN', amount: 2800000 },
  ];

  const recentTransactions = [
    { id: 1, user: "Nguyễn Văn A", plan: "Gói 1 Tháng", amount: 500000, date: new Date(), status: "PAID" },
    { id: 2, user: "Trần Thị B", plan: "PT 1-1", amount: 5000000, date: new Date(), status: "PENDING" },
    { id: 3, user: "Lê C", plan: "Vé Ngày", amount: 50000, date: new Date(), status: "PAID" },
    { id: 4, user: "Phạm D", plan: "Gói 3 Tháng", amount: 1350000, date: new Date(86400000), status: "PAID" },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-background min-h-screen text-foreground relative">
      
      {/* 1. WELCOME CARD (Gradient giống User) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4 text-white">
              <TrendingUp size={120} />
           </div>
           <div>
              <h1 className="text-2xl font-bold">Dashboard Quản Trị</h1>
              <p className="opacity-90 text-sm mt-1">Xin chào Admin, đây là tình hình kinh doanh hôm nay.</p>
              
              <div className="mt-6 flex gap-4">
                 <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">Doanh thu hôm nay</p>
                    <p className="font-bold text-xl">4.500.000 đ</p>
                 </div>
                 <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">Khách Check-in</p>
                    <p className="font-bold text-xl">128</p>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. STATS CARDS (Style giống "Action Card" của User) */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full mb-3">
                <Users size={24} />
             </div>
             <p className="text-sm text-gray-500">Tổng Hội Viên</p>
             <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-1">1,240</h3>
             <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+12% tháng này</span>
        </div>

        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full mb-3">
                <Activity size={24} />
             </div>
             <p className="text-sm text-gray-500">Đang Hoạt Động</p>
             <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-1">45</h3>
             <span className="text-xs text-gray-400">Thiết bị / 50 total</span>
        </div>
      </div>

      {/* 3. CHARTS & LISTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* DOANH THU CHART (Giống biểu đồ BMI của User) */}
         <div className="lg:col-span-2 bg-white dark:bg-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign size={20} className="text-blue-600"/> Biểu đồ doanh thu (Tuần)</h3>
               <select className="text-xs border p-1 rounded bg-slate-50 dark:bg-slate-900">
                  <option>Tuần này</option>
                  <option>Tháng này</option>
               </select>
            </div>
            <div className="h-[300px] w-full text-xs">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                     <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                     <XAxis dataKey="name" />
                     <YAxis tickFormatter={(value) => `${value/1000}k`} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                        formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                     />
                     <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* GIAO DỊCH GẦN ĐÂY (Giống Card History của User) */}
         <div className="bg-white dark:bg-card p-0 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
               <h3 className="font-bold text-lg">Giao dịch mới</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
               {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${t.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {t.user.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-sm text-gray-900 dark:text-white">{t.user}</p>
                           <p className="text-xs text-gray-500">{t.plan}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-sm text-blue-600">{t.amount.toLocaleString()} đ</p>
                        <p className="text-[10px] text-gray-400">{format(t.date, 'HH:mm dd/MM')}</p>
                     </div>
                  </div>
               ))}
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
               <button className="w-full py-2 text-xs font-bold text-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  Xem tất cả
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}