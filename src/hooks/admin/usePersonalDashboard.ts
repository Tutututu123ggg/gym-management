// hooks/usePersonalDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getStaffDashboardData, toggleStaffCheckIn, 
  toggleStaffTask, createStaffTask, deleteStaffTask 
} from '@/actions/staff/staff-home'; // Import gốc của bạn
import { createAnnouncement, deleteAnnouncement } from '@/actions/customer/announcement'; // Import gốc của bạn

export function usePersonalDashboard(userId: string) {
  const [data, setData] = useState<any>({
    isCheckedIn: false,
    currentSession: null,
    announcements: [],
    myTasks: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getStaffDashboardData(userId);
      if (res.success && res.data) {
        // Chuẩn hóa dữ liệu Date
        const session = res.data.currentSession ? {
          ...res.data.currentSession,
          checkInAt: new Date(res.data.currentSession.checkInAt)
        } : null;

        setData({ ...res.data, currentSession: session });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Wrapper functions cho các hành động
  const actions = {
    checkIn: async () => {
       const res = await toggleStaffCheckIn(userId);
       if (res.success) fetchData();
       return res;
    },
    task: {
       add: async (content: string, freq: string) => { await createStaffTask(userId, content, freq as any); fetchData(); },
       toggle: async (id: string, status: boolean) => { await toggleStaffTask(id, status); fetchData(); },
       delete: async (id: string) => { await deleteStaffTask(id); fetchData(); }
    },
    announcement: {
       add: async (title: string, content: string) => { await createAnnouncement(userId, title, content); fetchData(); },
       delete: async (id: string) => { await deleteAnnouncement(id); fetchData(); }
    }
  };

  return { data, loading, actions };
}