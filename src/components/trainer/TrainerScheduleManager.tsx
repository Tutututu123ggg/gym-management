"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTrainerScheduleAction } from "@/actions/trainer/trainer"; // Đã sửa import path
import { Loader2, Dumbbell } from "lucide-react";

// Import UI Components
import { ScheduleHeader } from "./ScheduleHeader";
import { ScheduleTabs } from "./ScheduleTabs";
import { ClassListWidget } from "./ClassListWidget"; // Tái sử dụng widget cũ

export default function TrainerScheduleManager() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const fetchSchedule = async () => {
    if (!user?.id) return;
    setLoading(true);
    // Gọi action lấy lịch (truyền activeTab xuống server để filter)
    const res = await getTrainerScheduleAction(user.id, activeTab);
    if (res.success) setClasses(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) fetchSchedule();
  }, [user?.id, activeTab]);

  return (
    <div className="space-y-6 fade-in pb-10">
      
      {/* 1. Header UI */}
      <ScheduleHeader />

      {/* 2. Tabs UI */}
      <ScheduleTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* 3. Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl bg-muted/10">
          <Loader2 className="animate-spin text-primary mb-2" size={32} />
          <span className="text-muted-foreground text-sm">Đang cập nhật dữ liệu...</span>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-1 md:p-6 border border-border shadow-sm min-h-[500px]">
           {/* Nếu danh sách trống thì hiện Empty State */}
           {classes.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                   <Dumbbell size={24} />
                </div>
                <p>Không tìm thấy lớp học nào trong mục này.</p>
             </div>
           ) : (
             <ClassListWidget classes={classes} />
           )}
        </div>
      )}
    </div>
  );
}