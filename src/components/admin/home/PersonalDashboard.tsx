"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePersonalDashboard } from '@/hooks/admin/usePersonalDashboard'; // Hook vừa tạo

// Import Components (Giả sử bạn đã tách ra như trên, hoặc để chung file nếu lười)
import CheckInCard from './CheckInCard'; 
import TaskCard from './TaskCard';
import AnnouncementBoard from './AnnouncementBoard'; // Bạn tự tách tương tự TaskCard
import QuickActions from './QuickActions'; // Component hiển thị grid icon

export interface QuickActionItem {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface PersonalDashboardProps {
  user: any;
  quickActions: QuickActionItem[];
  canManageAnnouncements?: boolean;
}

export default function PersonalDashboard({ user, quickActions, canManageAnnouncements = false }: PersonalDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Logic lấy từ Hook -> View không cần biết API gọi thế nào
  const { data, loading, actions } = usePersonalDashboard(user?.id);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Xin chào, {user?.name}! 👋</h1>
          <p className="text-slate-500 text-sm mt-1">{data.isCheckedIn ? 'Đang làm việc' : 'Chưa vào ca'}</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-2xl font-mono font-bold text-blue-600">{format(currentTime, 'HH:mm')}</p>
           <p className="text-xs text-slate-400 uppercase font-bold">{format(currentTime, 'EEEE, dd/MM/yyyy', { locale: vi })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COL */}
        <div className="space-y-6 lg:col-span-2">
           <CheckInCard 
              isCheckedIn={data.isCheckedIn} 
              session={data.currentSession} 
              onToggle={actions.checkIn} 
              currentTime={currentTime}
           />

           <QuickActions actions={quickActions} />

           <TaskCard 
              tasks={data.myTasks} 
              onAdd={actions.task.add} 
              onToggle={actions.task.toggle} 
              onDelete={actions.task.delete}
           />
        </div>

        {/* RIGHT COL */}
        <div className="space-y-6">
           <AnnouncementBoard 
              announcements={data.announcements}
              canManage={canManageAnnouncements}
              onAdd={actions.announcement.add}
              onDelete={actions.announcement.delete}
           />
        </div>
      </div>
    </div>
  );
}