import { useState, useEffect, useCallback } from 'react';
import { 
  getClassesAction, createClassAction, deleteClassAction, 
  getSessionsAction, getScheduleResourcesAction, createScheduleAction 
} from '@/actions/admin/admin-plan';
import { GymClassWithStats, CalendarEvent, CreateScheduleInput } from '@/types/admin/plan';

export function useClassSchedule(planId: string | null) {
  const [classes, setClasses] = useState<GymClassWithStats[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<{ trainers: any[], rooms: any[] }>({ trainers: [], rooms: [] });
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Load Classes & Resources
  useEffect(() => {
    if (!planId) return;
    getClassesAction(planId).then(res => {
        if (res.success) {
            setClasses(res.data);
            if (res.data.length > 0) setSelectedClassId(res.data[0].id);
        }
    });
    getScheduleResourcesAction().then(res => {
        if (res.success) setResources({ trainers: res.trainers || [], rooms: res.rooms || [] });
    });
  }, [planId]);

  // 2. Load Calendar Events
  useEffect(() => {
    if (!selectedClassId) { setEvents([]); return; }
    
    // Lấy lịch trong khoảng +- 2 tháng từ hiện tại (đơn giản hóa)
    const start = new Date(); start.setMonth(start.getMonth() - 1);
    const end = new Date(); end.setMonth(end.getMonth() + 2);
    
    getSessionsAction(start, end, selectedClassId).then(res => {
        if (res.success) setEvents(res.data as CalendarEvent[]);
    });
  }, [selectedClassId, refreshKey]);

  const refreshSchedule = () => setRefreshKey(k => k + 1);

  // --- ACTIONS ---
  const addClass = async (name: string) => {
    if (!planId) return;
    const res = await createClassAction(planId, name);
    if (res.success) {
        const updated = await getClassesAction(planId);
        if (updated.success) setClasses(updated.data);
    }
    return res;
  };

  const removeClass = async (id: string) => {
    const res = await deleteClassAction(id);
    if (res.success) {
        const updated = await getClassesAction(planId!);
        if (updated.success) {
            setClasses(updated.data);
            if (selectedClassId === id) setSelectedClassId(updated.data[0]?.id || null);
        }
    }
    return res;
  };

  const createSchedule = async (data: CreateScheduleInput) => {
    const res = await createScheduleAction(data);
    if (res.success) refreshSchedule();
    return res;
  };

  return {
    classes, selectedClassId, setSelectedClassId, events, resources,
    actions: { addClass, removeClass, createSchedule }
  };
}