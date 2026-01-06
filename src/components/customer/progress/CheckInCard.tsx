"use client";
import React from 'react';
import { UserStats } from '@/types/customer/progress';

interface Props {
  isWorkingOut: boolean;
  stats: UserStats;
  loading: boolean;
  onCheckIn: () => void;
}

export default function CheckInCard({ isWorkingOut, stats, loading, onCheckIn }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <p className="text-sm text-gray-500 mb-2">Trạng thái hiện tại</p>
        {isWorkingOut ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse mb-4">🟢 Đang tập luyện</span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-4">⚪ Đang ở ngoài</span>
        )}
        <button onClick={onCheckIn} disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all transform active:scale-95 ${isWorkingOut ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-100' : 'bg-emerald-500 hover:bg-emerald-600 ring-4 ring-emerald-100'}`}>
            {loading ? 'Đang xử lý...' : isWorkingOut ? 'CHECK-OUT (VỀ)' : 'CHECK-IN (VÀO)'}
        </button>
        <div className="mt-4 flex gap-4 text-xs text-gray-500 w-full justify-center">
            <div className="text-center">
                <span className="block font-bold text-lg text-gray-900 dark:text-gray-100">{stats.totalHours ? stats.totalHours.toFixed(1) : '0'}h</span> Tổng giờ tập
            </div>
            <div className="w-[1px] bg-gray-200 h-8 self-center"></div>
            <div className="text-center">
                <span className="block font-bold text-lg text-orange-500">{stats.currentStreak || 0}</span> Streak (ngày)
            </div>
        </div>
    </div>
  );
}