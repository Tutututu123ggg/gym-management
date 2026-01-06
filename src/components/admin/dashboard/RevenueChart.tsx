'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Loader2 } from 'lucide-react';
import { DashboardStats } from '@/types/admin/dashboard';
import { formatCurrency } from '@/lib/formatters';

interface Props {
  data: DashboardStats | null;
  loading: boolean;
  year: number;
  month?: number;
}

export default function RevenueChart({ data, loading, year, month }: Props) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-indigo-600" />
          </div>
        )}
        <h3 className="font-bold text-lg mb-8 flex items-center gap-2 text-slate-800 dark:text-white">
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
                    dataKey="name" axisLine={false} tickLine={false} 
                    tick={{ fill: '#64748b' }} dy={10}
                  />
                  <YAxis 
                    axisLine={false} tickLine={false} tick={{ fill: '#64748b' }}
                    tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                  />
                  <Area 
                    type="monotone" dataKey="amount" stroke="#4f46e5" 
                    fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} animationDuration={1500}
                  />
              </AreaChart>
           </ResponsiveContainer>
        </div>
     </div>
  );
}