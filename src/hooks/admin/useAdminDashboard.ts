"use client";

import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '@/actions/customer/dashboard';
import { DashboardStats } from '@/types/admin/dashboard';

export function useAdminDashboard() {
  // Quản lý state bộ lọc
  const [filter, setFilter] = useState({
    year: new Date().getFullYear(),
    month: undefined as number | undefined
  });

  // Quản lý state dữ liệu
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Logic gọi API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi Server Action
      const res = await getDashboardStats(filter.year, filter.month);
      setData(res);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      // Có thể thêm toast error tại đây
    } finally {
      setLoading(false);
    }
  }, [filter.year, filter.month]);

  // Trigger khi filter thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions để update filter
  const setYear = (year: number) => setFilter(prev => ({ ...prev, year }));
  const setMonth = (month: number | undefined) => setFilter(prev => ({ ...prev, month }));

  return {
    data,
    loading,
    filter,
    actions: { setYear, setMonth, refresh: fetchData }
  };
}