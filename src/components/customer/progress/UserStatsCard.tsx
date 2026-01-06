"use client";
import React from 'react';
import { format } from 'date-fns';
import { UserStats, Plan, Subscription } from '@/types/customer/progress';

interface Props {
  user: { name: string | null };
  stats: UserStats;
  plan: Plan | null;
  subscription: Subscription | null;
}

export default function UserStatsCard({ user, stats, plan, subscription }: Props) {
  return (
    <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden h-full min-h-[200px]">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </div>
        <div>
            <h1 className="text-2xl font-bold">Xin chào, {user?.name || 'Gymer'} !</h1>
            <div className="mt-4 flex items-center gap-3 bg-white/20 p-3 rounded-lg backdrop-blur-sm w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                <div>
                    <p className="text-xs opacity-80">Gói tập hiện tại</p>
                    <p className="font-semibold text-sm">{plan ? plan.name : 'Chưa đăng ký gói'}</p>
                </div>
            </div>
            {subscription && (
                <p className="mt-2 text-xs opacity-70">Hết hạn: {format(new Date(subscription.endDate), 'dd/MM/yyyy')}</p>
            )}
        </div>
    </div>
  );
}