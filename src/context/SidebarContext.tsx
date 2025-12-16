"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarContextType {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // --- XỬ LÝ TỰ ĐÓNG MƯỢT MÀ KHI CHUYỂN TRANG ---
  useEffect(() => {
    // Chỉ chạy logic này nếu sidebar đang mở
    if (isMobileOpen) {
      // Đặt một độ trễ nhỏ (ví dụ 200ms)
      // Điều này giúp animation trượt vào có thời gian chuẩn bị và chạy mượt mà
      // thay vì bị ngắt quãng do việc render trang mới.
      const timer = setTimeout(() => {
        setIsMobileOpen(false);
      }, 200);

      // Dọn dẹp timer nếu component bị hủy (tránh memory leak)
      return () => clearTimeout(timer);
    }
  }, [pathname]); // Theo dõi pathname: cứ đổi link là chạy effect này

  return (
    <SidebarContext.Provider value={{ isMobileOpen, toggleMobileSidebar, closeMobileSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};