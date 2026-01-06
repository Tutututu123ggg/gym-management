import { useState, useEffect, useCallback } from 'react';
import { getStaffKPIsAction, upsertKPIAction } from '@/actions/admin/admin-staff';
import { StaffKPIResult, EditState } from '@/types/admin/staff';
import { addMonths, subMonths } from 'date-fns';

export function useStaff() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [staffList, setStaffList] = useState<StaffKPIResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Lưu tạm giá trị đang nhập: Record<userId, EditState>
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const res = await getStaffKPIsAction(currentMonth);
        if (res.success && res.data) {
            setStaffList(res.data);
            setEdits({}); // Reset form khi đổi tháng/reload
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handlers
  const changeMonth = (direction: 'PREV' | 'NEXT') => {
    setCurrentMonth(prev => direction === 'PREV' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const handleInputChange = (userId: string, field: keyof EditState, value: string | number) => {
    setEdits(prev => {
      const originalStaff = staffList.find(s => s.id === userId);
      // Lấy giá trị hiện tại hoặc fallback về data gốc
      const currentVal: EditState = prev[userId] || {
        kpi: originalStaff?.kpiData?.kpiScore || 0,
        sessions: originalStaff?.kpiData?.sessions || 0,
        bonus: originalStaff?.kpiData?.bonus || 0,
        notes: originalStaff?.kpiData?.notes || ''
      };

      return {
        ...prev,
        [userId]: { ...currentVal, [field]: value }
      };
    });
  };

  const handleUseSuggestion = (staff: StaffKPIResult) => {
    handleInputChange(staff.id, 'sessions', staff.suggestedSessions);
  };

  const saveKPI = async (staff: StaffKPIResult) => {
    // Ưu tiên lấy data từ state edits, nếu không có thì giữ nguyên data cũ
    const dataToSave = edits[staff.id] || {
        kpi: staff.kpiData?.kpiScore || 0,
        sessions: staff.kpiData?.sessions || 0,
        bonus: staff.kpiData?.bonus || 0,
        notes: staff.kpiData?.notes || ''
    };

    setSavingId(staff.id);
    const res = await upsertKPIAction({
        userId: staff.id,
        month: currentMonth,
        kpiScore: Number(dataToSave.kpi),
        sessions: Number(dataToSave.sessions),
        bonus: Number(dataToSave.bonus),
        notes: dataToSave.notes
    });
    setSavingId(null);

    if (res.success) {
        await fetchData(); // Reload lại data sạch từ server
        return true;
    } else {
        alert(res.message);
        return false;
    }
  };

  return {
    currentMonth,
    staffList,
    loading,
    edits,
    savingId,
    actions: {
        changeMonth,
        handleInputChange,
        handleUseSuggestion,
        saveKPI
    }
  };
}