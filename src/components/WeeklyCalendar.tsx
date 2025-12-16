"use client";

import React, { useState } from 'react';
import { 
  format, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, addWeeks, subWeeks, isToday 
} from 'date-fns';
import { vi } from 'date-fns/locale';

// Icons SVG đơn giản
const Icons = {
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
};

type Schedule = { 
  id: string; 
  title: string; 
  date: Date; 
  type: 'WITH_TRAINER' | 'SELF_PRACTICE'; 
  isCompleted: boolean 
};

interface WeeklyCalendarProps {
  schedules: Schedule[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export default function WeeklyCalendar({ schedules, onToggleStatus }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // T2
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }); // CN
  const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate });

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-muted/30">
        <h2 className="font-bold text-lg capitalize text-gray-800 dark:text-gray-200">
          {format(currentDate, 'MMMM yyyy', { locale: vi })}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"><Icons.ChevronLeft /></button>
          <button onClick={() => setCurrentDate(new Date())} className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors">Hôm nay</button>
          <button onClick={nextWeek} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"><Icons.ChevronRight /></button>
        </div>
      </div>

      {/* BODY GRID */}
      <div className="flex-1 overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px] h-full divide-x divide-gray-200 dark:divide-gray-800">
          {daysInWeek.map((day) => {
            const isDayToday = isToday(day);
            const dailySchedules = schedules.filter(s => isSameDay(new Date(s.date), day));

            return (
              <div key={day.toString()} className={`flex flex-col h-full min-h-[300px] ${isDayToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                
                {/* Ngày tháng */}
                <div className={`text-center py-3 border-b border-gray-100 dark:border-gray-800 ${isDayToday ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                  <div className="text-xs uppercase mb-1">{format(day, 'EEEE', { locale: vi })}</div>
                  <div className={`text-xl inline-flex items-center justify-center w-8 h-8 rounded-full ${isDayToday ? 'bg-blue-600 text-white' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* List Tasks */}
                <div className="flex-1 p-2 space-y-2">
                  {dailySchedules.map((schedule) => (
                    <div 
                      key={schedule.id}
                      onClick={() => onToggleStatus(schedule.id, schedule.isCompleted)}
                      className={`
                        group relative p-2 rounded-md border text-xs cursor-pointer transition-all hover:shadow-md
                        ${schedule.isCompleted 
                          ? 'bg-green-50 border-green-200 text-green-800 opacity-60 line-through dark:bg-green-900/20 dark:border-green-800' 
                          : schedule.type === 'WITH_TRAINER' 
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800' 
                            : 'bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
                        }
                      `}
                    >
                      <div className="font-semibold truncate pr-3">{schedule.title}</div>
                      <div className={`absolute top-2 right-2 ${schedule.isCompleted ? 'block' : 'hidden group-hover:block'}`}>
                        <Icons.Check />
                      </div>
                      <div className="text-[10px] mt-1 opacity-80">
                        {format(new Date(schedule.date), 'HH:mm')} • {schedule.type === 'WITH_TRAINER' ? 'HLV' : 'Tự'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}