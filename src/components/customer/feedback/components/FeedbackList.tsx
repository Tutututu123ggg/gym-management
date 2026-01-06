"use client";
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { FeedbackItem as IFeedbackItem } from '@/types/customer/customer-feedback';
import FeedbackItem from './FeedbackItem';

interface Props {
  feedbacks: IFeedbackItem[];
  loading: boolean;
}

export default function FeedbackList({ feedbacks, loading }: Props) {
  return (
    <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold mb-2 flex items-center justify-between text-slate-800 dark:text-white">
            <span>Lịch sử gửi tin</span>
            <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {feedbacks.length} tin nhắn
            </span>
        </h2>

        {loading ? (
            <div className="text-center py-10 text-slate-400">Đang tải dữ liệu...</div>
        ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-slate-300 dark:border-gray-700">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Bạn chưa gửi phản hồi nào.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {feedbacks.map((item) => (
                    <FeedbackItem key={item.id} item={item} />
                ))}
            </div>
        )}
    </div>
  );
}