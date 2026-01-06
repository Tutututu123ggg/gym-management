"use client";
import React from 'react';
import { FeedbackFilterStatus } from '@/types/admin/feedback';

interface FeedbackFiltersProps {
  currentFilter: FeedbackFilterStatus;
  onChange: (filter: FeedbackFilterStatus) => void;
}

export default function FeedbackFilters({ currentFilter, onChange }: FeedbackFiltersProps) {
  return (
    <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
      {(['ALL', 'PENDING', 'REPLIED'] as FeedbackFilterStatus[]).map((tabKey) => (
        <button
          key={tabKey}
          onClick={() => onChange(tabKey)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 
            ${currentFilter === tabKey 
              ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
        >
          {tabKey === 'ALL' ? 'Tất cả' : (tabKey === 'PENDING' ? 'Chờ xử lý' : 'Đã trả lời')}
        </button>
      ))}
    </div>
  );
}