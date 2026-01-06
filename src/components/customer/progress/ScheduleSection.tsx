"use client";
import React from 'react';
import WeeklyCalendar from '@/components/customer/plans/WeeklyCalendar'; 
import { Schedule } from '@/types/customer/progress';

interface Props {
  schedules: Schedule[];
  onToggle: (id: string, status: boolean) => void;
  // onAdd prop bị loại bỏ vì form đã tách ra
}

export default function ScheduleSection({ schedules, onToggle }: Props) {
  return (
    <div className="space-y-4 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-xl font-bold">📅 Lịch trình tập luyện</h2>
            <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300"></span> 
                    Lớp cố định
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300"></span> 
                    Tự tập (Click để hoàn thành)
                </span>
            </div>
        </div>
        
        {/* Render Calendar */}
        <div className="flex-1 min-h-[500px]">
             <WeeklyCalendar schedules={schedules} onToggleStatus={onToggle} />
        </div>
    </div>
  );
}