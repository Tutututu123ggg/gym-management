"use client";
import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '@/types/admin/plan';

const locales = { 'vi': vi };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function ScheduleCalendar({ events }: { events: CalendarEvent[] }) {
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());

  return (
    <div className="h-full">
        {/* Style đè CSS mặc định của BigCalendar */}
        <style jsx global>{`
            .rbc-calendar { color: #1e293b !important; }
            .rbc-off-range-bg { background-color: #f1f5f9 !important; }
            .rbc-header { color: #0f172a !important; font-weight: bold; border-bottom-color: #e2e8f0 !important; }
            .rbc-day-bg + .rbc-day-bg { border-left-color: #e2e8f0 !important; }
            .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: #cbd5e1 !important; }
            .rbc-month-row + .rbc-month-row { border-top-color: #e2e8f0 !important; }
            .rbc-timeslot-group { border-bottom-color: #e2e8f0 !important; }
            .rbc-day-slot .rbc-time-slot { border-top-color: #e2e8f0 !important; }
            .rbc-time-header.rbc-overflowing { border-right-color: #e2e8f0 !important; }
            .rbc-time-content { border-top-color: #e2e8f0 !important; }
            .rbc-time-gutter .rbc-timeslot-group { border-bottom-color: #e2e8f0 !important; }
            .rbc-label { color: #64748b !important; }
            .rbc-current-time-indicator { background-color: #3b82f6 !important; }
        `}</style>
        <Calendar 
            localizer={localizer} 
            events={events} 
            startAccessor="start" 
            endAccessor="end" 
            style={{ height: '100%' }} 
            view={view}
            date={date}
            onView={(v: any) => setView(v)}
            onNavigate={(d) => setDate(d)}
            views={[Views.MONTH, Views.WEEK]} 
            defaultView={Views.WEEK} 
            culture='vi' 
            eventPropGetter={() => ({ className: 'bg-blue-100 text-blue-700 border-l-4 border-blue-600 text-xs font-semibold' })} 
        />
    </div>
  );
}