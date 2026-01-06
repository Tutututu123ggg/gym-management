import React from 'react';
import { format } from 'date-fns';
import { DashboardStats } from '@/types/admin/dashboard';

interface Props {
  data: DashboardStats | null;
}

export default function RecentTransactions({ data }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[480px]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
           <h3 className="font-bold text-lg text-slate-800 dark:text-white">Giao dịch gần đây</h3>
           <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold uppercase">Mới nhất</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
           {data?.recentTransactions.length === 0 ? (
             <div className="h-full flex items-center justify-center text-gray-400 text-sm">Không có giao dịch nào</div>
           ) : (
             data?.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all group">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-200 group-hover:scale-110 transition-transform">
                         {t.user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                         <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{t.user.name || "N/A"}</p>
                         <p className="text-xs text-slate-500">{t.subscription.plan.name}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-sm text-indigo-600">{t.amount.toLocaleString()} đ</p>
                      <p className="text-[10px] text-slate-400 font-medium">{format(new Date(t.createdAt), 'dd/MM HH:mm')}</p>
                   </div>
                </div>
             ))
           )}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
           <button className="w-full py-2.5 text-xs font-bold text-indigo-600 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
             Xem báo cáo chi tiết
           </button>
        </div>
     </div>
  );
}