"use client";
import React from 'react';
import { Filter, Search } from 'lucide-react';
import { EquipmentStatus } from '@prisma/client';
import { RoomWithCategories } from '@/types/admin/equipment';

interface Props {
  rooms: RoomWithCategories[];
  filters: any;
  setFilters: any;
}

export default function EquipmentFilters({ rooms, filters, setFilters }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 w-full lg:w-auto min-w-fit">
        <Filter size={18} /> <span className="text-sm font-medium">Bộ lọc:</span>
      </div>
      
      <select 
        className="p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 w-full lg:w-48 outline-none" 
        value={filters.filterRoom} 
        onChange={(e) => setFilters.setFilterRoom(e.target.value)}
      >
        <option value="ALL">🏠 Tất cả phòng</option>
        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      
      <select 
        className="p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 w-full lg:w-48 outline-none" 
        value={filters.filterStatus} 
        onChange={(e) => setFilters.setFilterStatus(e.target.value as EquipmentStatus | 'ALL')}
      >
        <option value="ALL">📊 Tất cả trạng thái</option>
        <option value="MAINTENANCE">🛠️ Đang bảo trì</option>
        <option value="BROKEN">❌ Hỏng / Ngưng</option>
        <option value="GOOD">✅ Hoạt động tốt</option>
      </select>
      
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm kiếm theo tên hoặc mã..." 
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 outline-none" 
          value={filters.searchTerm} 
          onChange={(e) => setFilters.setSearchTerm(e.target.value)} 
        />
      </div>
    </div>
  );
}