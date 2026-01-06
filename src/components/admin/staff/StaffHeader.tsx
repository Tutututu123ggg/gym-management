"use client";
import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Award, CalendarCheck } from 'lucide-react';

interface Props {
  currentMonth: Date;
  onChangeMonth: (dir: 'PREV' | 'NEXT') => void;
}

export default function StaffHeader({ currentMonth, onChangeMonth }: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
       <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <Award className="text-yellow-500"/> Quản Lý KPI & Nhân Sự
          </h1>
          <p className="text-sm text-slate-500">Đánh giá hiệu suất và tính thưởng hàng tháng.</p>
       </div>
       
       <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button onClick={() => onChangeMonth('PREV')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
             <ChevronLeft size={20}/>
          </button>
          
          <div className="flex items-center gap-2 px-2">
             <CalendarCheck size={20} className="text-blue-600"/>
             <span className="font-bold text-lg text-slate-800 dark:text-white capitalize min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
             </span>
          </div>
          
          <button onClick={() => onChangeMonth('NEXT')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
             <ChevronRight size={20}/>
          </button>
       </div>
    </div>
  );
}