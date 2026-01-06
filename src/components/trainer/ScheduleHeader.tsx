"use client";

import { Filter, RefreshCw } from "lucide-react";

export const ScheduleHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Quản lý Lịch dạy
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi và quản lý toàn bộ các lớp học bạn phụ trách.
        </p>
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center gap-2">
         {/* Nút Lọc: bg-card, border-border */}
         <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground shadow-sm">
            <Filter size={16} /> Lọc
         </button>
         
         {/* Nút Đồng bộ: bg-primary */}
         <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow hover:opacity-90 transition-opacity">
            <RefreshCw size={16} /> Đồng bộ
         </button>
      </div>
    </div>
  );
};