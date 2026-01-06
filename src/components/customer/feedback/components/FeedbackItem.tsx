"use client";
import React from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle } from 'lucide-react';
import { FeedbackItem as CustomerFeedbackItem } from '@/types/customer/customer-feedback';

export default function FeedbackItem({ item }: { item: CustomerFeedbackItem }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 border-b border-slate-100 dark:border-gray-700 pb-3">
            <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Clock size={14} /> {format(new Date(item.createdAt), "HH:mm - dd/MM/yyyy")}
                </div>
            </div>
            <div>
                {item.status === 'REPLIED' ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                        <CheckCircle size={14} /> Đã trả lời
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
                        ⏳ Đang chờ xử lý
                    </span>
                )}
            </div>
        </div>

        {/* User Content */}
        <div className="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
            {item.message}
        </div>

        {/* Admin Reply */}
        {item.reply && (
            // 👇 ĐÃ SỬA: Xóa class "ml-0 md:ml-8" và thay bằng "mt-4" để tạo khoảng cách bên trên
            <div className="mt-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">Quản trị viên</span>
                        <span className="text-[10px] text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full">Support Team</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 text-sm">{item.reply}</p>
                </div>
            </div>
        )}
    </div>
  );
}