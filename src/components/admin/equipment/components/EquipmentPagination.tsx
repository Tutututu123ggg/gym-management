"use client";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export default function EquipmentPagination({ currentPage, totalPages, totalItems, loading, onPageChange }: Props) {
  if (totalItems === 0) return null;

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-950 rounded-b-xl">
       <div className="text-sm text-slate-500 dark:text-slate-400">Trang <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span> / {totalPages} ({totalItems} kết quả)</div>
       <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1 || loading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"><ChevronLeft size={16} /> Trước</button>
          {/* Simple Pagination Numbers (Compact Version) */}
          <div className="flex gap-1 hidden sm:flex">
             {currentPage > 1 && <button onClick={() => onPageChange(currentPage - 1)} disabled={loading} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">{currentPage - 1}</button>}
             <button disabled className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/30">{currentPage}</button>
             {currentPage < totalPages && <button onClick={() => onPageChange(currentPage + 1)} disabled={loading} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">{currentPage + 1}</button>}
          </div>
          <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || loading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">Sau <ChevronRight size={16} /></button>
       </div>
    </div>
  );
}