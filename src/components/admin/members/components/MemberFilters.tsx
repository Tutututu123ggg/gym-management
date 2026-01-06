"use client";
import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  search: string;
  setSearch: (val: string) => void;
}

export default function MemberFilters({ search, setSearch }: Props) {
  return (
    <div className="relative max-w-md">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
       <input 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Tìm theo tên, email, sđt..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
       />
    </div>
  );
}