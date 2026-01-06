"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTrainerDashboardAction } from "@/actions/trainer/trainer"; // Đã sửa import path
import { Loader2 } from "lucide-react";

import { CheckInWidget } from "./CheckInWidget";
import { AnnouncementWidget } from "./AnnouncementWidget";
import { ClassListWidget } from "./ClassListWidget";

export default function TrainerHome() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await getTrainerDashboardAction(user.id);
    if (res.success) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  if (loading || !data) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {/* Text-foreground */}
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan ngày làm việc của {user?.name}.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
          <div className="flex-none">
             <CheckInWidget 
               isCheckedIn={data.isCheckedIn} 
               onRefresh={fetchData} 
             />
          </div>
          <div className="flex-1 min-h-[300px]">
             <AnnouncementWidget announcements={data.announcements} />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Lớp học sắp tới
            </h2>
            {/* Badge: bg-primary/10 text-primary */}
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
              Hôm nay & Tuần này
            </span>
          </div>
          
          <ClassListWidget classes={data.upcomingClasses} />
        </div>
      </div>
    </div>
  );
}