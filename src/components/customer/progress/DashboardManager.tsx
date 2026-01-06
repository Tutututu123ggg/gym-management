"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/hooks/customer/useProgress';

import UserStatsCard from './UserStatsCard';
import CheckInCard from './CheckInCard';
import HistoryCard from './HistoryCard';
import ScheduleSection from './ScheduleSection';
import MetricsSection from './MetricsSection';
import AddScheduleForm from './AddScheduleForm';
import MetricModal from './MetricModal';

export default function DashboardManager() {
  const router = useRouter();
  const { data, loading, isLoggedIn, user, actions } = useProgress();
  const [isMetricModalOpen, setIsMetricModalOpen] = React.useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-background min-h-screen text-foreground relative">
      
      <MetricModal 
        isOpen={isMetricModalOpen} 
        onClose={() => setIsMetricModalOpen(false)} 
        onSave={actions.addMetric} 
      />

      {/* --- TOP ROW: STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <UserStatsCard 
            user={{ name: user?.name || '' }} 
            stats={data.stats} 
            plan={data.plan} 
            subscription={data.subscription} 
        />
        <div className="md:col-span-1">
            <CheckInCard 
                isWorkingOut={data.isWorkingOut} 
                stats={data.stats} 
                loading={loading} 
                onCheckIn={actions.checkIn} 
            />
        </div>
        <div className="md:col-span-1">
            <HistoryCard history={data.history} />
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: CALENDAR (Chiếm 2 phần) */}
        <div className="lg:col-span-2 min-w-0"> 
             <ScheduleSection 
                schedules={data.schedules} 
                onToggle={actions.toggleSchedule} 
             />
        </div>

        {/* RIGHT: SIDEBAR (Add Form + Chart) (Chiếm 1 phần) */}
        <div className="space-y-6 flex flex-col">
            {/* Form thêm lịch */}
            <AddScheduleForm onAdd={actions.addSchedule} />

            {/* Biểu đồ BMI */}
            <div className="flex-1 min-h-[300px]">
                <MetricsSection 
                    metrics={data.metrics} 
                    onOpenModal={() => setIsMetricModalOpen(true)} 
                />
            </div>
        </div>

      </div>
    </div>
  );
}