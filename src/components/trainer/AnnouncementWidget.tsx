"use client";

import { Bell, ChevronRight } from 'lucide-react';

export const AnnouncementWidget = ({ announcements }: { announcements: any[] }) => {
  return (
    // THAY ĐỔI: bg-card, border-border
    <div className="bg-card rounded-2xl shadow-sm border border-border h-full flex flex-col text-card-foreground">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bell className="text-yellow-500 fill-yellow-500" size={18} />
          Thông báo
        </h3>
        {/* Badge: bg-secondary */}
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {announcements.length} mới
        </span>
      </div>

      <div className="p-2 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Không có thông báo nào.
          </div>
        ) : (
          <div className="space-y-1">
            {announcements.map((item) => (
              <div 
                key={item.id} 
                // Hover: bg-muted
                className="group p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {announcements.length > 0 && (
        <div className="p-3 border-t border-border text-center">
          <button className="text-xs font-medium text-primary hover:underline flex items-center justify-center w-full">
            Xem tất cả <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};