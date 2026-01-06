import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getDashboardDataAction, toggleCheckInAction, 
  addScheduleAction, toggleScheduleStatusAction, 
  addBodyMetricAction 
} from '@/actions/customer/progress';
import { DashboardData, Schedule } from '@/types/customer/progress';

export function useProgress() {
  const { user, isLoggedIn } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getDashboardDataAction(user.id);
      if (res.success && res.data) {
        // [IMPORTANT] Convert string date to Date object
        const formattedSchedules = res.data.schedules.map((s: any) => ({
            ...s,
            date: new Date(s.date)
        }));
        
        setData({
            ...res.data,
            schedules: formattedSchedules as Schedule[]
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [user?.id, refreshKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = () => setRefreshKey(k => k + 1);

  // --- ACTIONS ---
  const handleCheckIn = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await toggleCheckInAction(user.id);
    if (res.success) {
        // alert(res.message); // Có thể bỏ alert nếu muốn UX mượt hơn
        refresh();
    }
    setLoading(false);
  };

  const handleAddSchedule = async (scheduleData: { title: string, date: string, type: string, trainerName?: string }) => {
    if (!user?.id) return;
    await addScheduleAction(user.id, {
        ...scheduleData,
        date: new Date(scheduleData.date)
    });
    refresh();
  };

  const handleToggleSchedule = async (id: string, status: boolean) => {
    await toggleScheduleStatusAction(id, status);
    refresh();
  };

  const handleAddMetric = async (height: string, weight: string) => {
    if (!user?.id) return;
    await addBodyMetricAction(user.id, parseFloat(height), parseFloat(weight));
    refresh();
  };

  return {
    data,
    loading,
    isLoggedIn,
    user,
    actions: {
        refresh,
        checkIn: handleCheckIn,
        addSchedule: handleAddSchedule,
        toggleSchedule: handleToggleSchedule,
        addMetric: handleAddMetric
    }
  };
}