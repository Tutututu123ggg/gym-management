"use client";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMetadata } from '@/types/admin/feedback';

interface PaginationControlProps {
  pagination: PaginationMetadata;
  onPageChange: (page: number) => void;
}

export default function PaginationControl({ pagination, onPageChange }: PaginationControlProps) {
  if (pagination.total === 0) return null;

  return (
    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
      <span className="text-sm text-slate-500">Tổng: <span className="font-bold">{pagination.total}</span> phản hồi</span>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">Trang {pagination.currentPage} / {pagination.totalPages}</span>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}