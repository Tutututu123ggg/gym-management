"use client";

import { Calendar, Archive } from "lucide-react";

interface ScheduleTabsProps {
  activeTab: 'upcoming' | 'history';
  onChange: (tab: 'upcoming' | 'history') => void;
}

export const ScheduleTabs = ({ activeTab, onChange }: ScheduleTabsProps) => {
  return (
    <div className="flex p-1 bg-muted/60 border border-border rounded-xl w-fit">
      <button
        onClick={() => onChange('upcoming')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === 'upcoming' 
            ? 'bg-card text-card-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Calendar size={16} /> Sắp diễn ra
      </button>
      <button
        onClick={() => onChange('history')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === 'history' 
            ? 'bg-card text-card-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Archive size={16} /> Lịch sử
      </button>
    </div>
  );
};