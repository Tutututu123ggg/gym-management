import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

interface Props {
  year: number;
  month: number | undefined;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number | undefined) => void;
}

// CẤU HÌNH: Năm hệ thống bắt đầu vận hành (Ví dụ: 2024)
// Bạn chỉ cần set số này 1 lần duy nhất lúc code.
const SYSTEM_START_YEAR = 2022; 

export default function DashboardFilter({ year, month, onYearChange, onMonthChange }: Props) {
  
  // Logic tự động tính toán danh sách năm
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear(); // Lấy năm hiện tại thực tế (ví dụ: 2026)
    const list: number[] = [];

    // Chạy vòng lặp từ năm bắt đầu (2024) đến năm hiện tại (2026...)
    for (let y = SYSTEM_START_YEAR; y <= currentYear; y++) {
      list.push(y);
    }

    // Sắp xếp giảm dần để năm mới nhất (2026) lên đầu danh sách
    return list.sort((a, b) => b - a);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <Calendar size={18} className="text-slate-400 ml-1" />
      
      {/* Select Năm */}
      <div className="relative">
        <select 
          value={year} 
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="bg-transparent text-sm font-bold outline-none cursor-pointer text-slate-900 dark:text-white pr-2 appearance-none hover:text-indigo-600 transition-colors"
        >
          {years.map((y) => (
            <option key={y} value={y} className="text-black dark:text-white bg-white dark:bg-slate-800">
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600 mx-1" />

      {/* Select Tháng */}
      <div className="relative">
        <select 
          value={month || ""} 
          onChange={(e) => onMonthChange(e.target.value ? Number(e.target.value) : undefined)}
          className="bg-transparent text-sm font-bold outline-none cursor-pointer text-slate-900 dark:text-white pr-2 appearance-none hover:text-indigo-600 transition-colors"
        >
          <option value="" className="text-black dark:text-white bg-white dark:bg-slate-800">Cả năm</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1} className="text-black dark:text-white bg-white dark:bg-slate-800">
              Tháng {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}