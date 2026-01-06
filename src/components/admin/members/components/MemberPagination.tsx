"use client";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function MemberPagination({ currentPage, totalPages, totalItems, onPageChange }: Props) {
  if (totalItems === 0) return null;

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center rounded-b-xl">
        <div className="text-sm text-slate-500">
            Hiển thị <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span> trang ({totalItems} kết quả)
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage <= 1} 
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <ChevronLeft size={18} />
            </button>
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage >= totalPages} 
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <ChevronRight size={18} />
            </button>
        </div>
    </div>
  );
}