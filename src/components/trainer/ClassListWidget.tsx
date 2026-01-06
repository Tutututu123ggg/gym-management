"use client";

import { Calendar, Users, MapPin, Clock } from 'lucide-react';

type ClassItem = {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  maxCapacity: number;
  gymClass: { name: string };
  room: { name: string } | null;
  _count: { bookings: number };
};

export const ClassListWidget = ({ classes }: { classes: ClassItem[] }) => {
  if (!classes || classes.length === 0) {
    // Empty State: Dùng bg-muted/30 và border-border
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-2xl border border-dashed border-border">
        <Calendar size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">Hôm nay bạn rảnh rỗi!</p>
        <p className="text-xs text-muted-foreground/70">Không có lớp học nào sắp tới.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((cls) => {
        const capacityPercent = Math.min((cls._count.bookings / cls.maxCapacity) * 100, 100);
        
        return (
          <div 
            key={cls.id} 
            // THAY ĐỔI: bg-card, border-border
            className="group flex flex-col md:flex-row bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Cột thời gian: Dùng bg-secondary hoặc bg-muted để tạo độ tương phản nhẹ */}
            <div className="md:w-24 bg-secondary/50 flex flex-row md:flex-col items-center justify-center p-4 text-primary gap-2 md:gap-0 border-b md:border-b-0 md:border-r border-border">
              <span className="text-lg font-bold">
                {new Date(cls.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs opacity-70 text-muted-foreground">
                {new Date(cls.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                {/* Dùng text-card-foreground */}
                <h4 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                  {cls.gymClass.name}
                </h4>
                {/* Badge: bg-secondary, text-secondary-foreground */}
                <div className="flex items-center text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                   <MapPin size={12} className="mr-1" />
                   {cls.room?.name || 'Chưa xếp phòng'}
                </div>
              </div>

              {/* Thông tin phụ: text-muted-foreground */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> 
                    {((new Date(cls.endTime).getTime() - new Date(cls.startTime).getTime()) / 60000)} phút
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users size={14} className={capacityPercent > 80 ? 'text-orange-500' : 'text-primary'} />
                  <span className="font-medium text-foreground">
                    {cls._count.bookings}/{cls.maxCapacity}
                  </span>
                </div>
              </div>

              {/* Capacity Bar: bg-secondary cho nền */}
              <div className="w-full h-1.5 bg-secondary rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    capacityPercent > 90 ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};