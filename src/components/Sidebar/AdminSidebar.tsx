"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { useSidebar } from '@/context/SidebarContext'; 
import { useAuth } from '@/context/AuthContext'; 
import mainGymIcon from '@/assets/main-gym-icon.png'; 

// Import Lucide Icons
import { 
  Home, LayoutDashboard, Users, CreditCard, Dumbbell, 
  MessageSquare, UserPlus, Briefcase, LogOut, 
  Menu, X, Sun, Moon
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

const AdminSidebar = () => {
  const { isMobileOpen, toggleMobileSidebar, closeMobileSidebar } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Menu riêng cho Admin
  const adminMenuItems: MenuItem[] = [
    { name: 'Trang chủ', href: '/admin/home', icon: Home },
    { name: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hội viên & Đăng ký', href: '/admin/members', icon: Users },
    { name: 'Gói tập & Dịch vụ', href: '/admin/plans', icon: CreditCard },
    { name: 'Quản lý Thiết bị', href: '/admin/equipment', icon: Dumbbell },
    { name: 'Phản hồi & CSKH', href: '/admin/feedbacks', icon: MessageSquare },
    { name: 'Nhân sự & KPI', href: '/admin/staff', icon: Briefcase },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Nút Hamburger (Mobile) */}
      {!isMobileOpen && (
        <button 
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-sidebar text-sidebar-foreground border border-sidebar-border rounded-md md:hidden hover:bg-sidebar-accent transition-colors duration-300"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <nav className={`
        fixed top-0 left-0 
        h-[100dvh] 
        bg-sidebar text-sidebar-foreground border-r border-sidebar-border
        shadow-xl z-50 transition-all duration-300 ease-in-out 
        group w-64 md:w-20 md:hover:w-64 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
        flex flex-col
      `}>
        
        {/* HEADER - Đã đồng bộ cấu trúc HTML với bên Khách */}
        <div className="h-20 md:h-24 border-b border-sidebar-border whitespace-nowrap overflow-hidden relative flex items-center px-4 md:px-0 shrink-0">
          <div className="flex items-center w-full">
            <div className="md:w-20 md:flex md:justify-center shrink-0">
               <div className="w-10 h-10 relative">
                 <Image src={mainGymIcon} alt="Gym Logo" fill className="object-contain" sizes="40px" />
               </div>
            </div>
            {/* 👇 FIX: Bỏ dòng Admin Portal, chỉ giữ Gym Master để căn giữa y hệt bên Member */}
            <span className="font-bold text-xl ml-3 md:ml-0 transition-all duration-300 whitespace-nowrap overflow-hidden md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
               Gym Master
            </span>
          </div>
          <button onClick={closeMobileSidebar} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 custom-scrollbar min-h-0 overflow-x-hidden">
          {adminMenuItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <div key={index}>
                 <Link 
                  href={item.href} 
                  className={`
                    flex items-center transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3
                    ${isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary' 
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground border-l-4 border-transparent'}
                  `}
                >
                  <span className={`md:w-20 md:justify-center flex items-center justify-start shrink-0`}>
                    <Icon size={24} strokeWidth={2} />
                  </span>
                  <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
                    {item.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="border-t border-sidebar-border p-2 shrink-0 space-y-1 pb-8 md:pb-2 overflow-hidden">
          
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3 rounded-md"
          >
            <span className="md:w-20 md:justify-center flex items-center justify-start shrink-0 text-yellow-500">
              <Moon className="hidden dark:block w-6 h-6" />
              <Sun className="block dark:hidden w-6 h-6" />
            </span>
            <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
              Giao diện
            </span>
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3 rounded-md group/logout"
          >
            <span className="md:w-20 md:justify-center flex items-center justify-start shrink-0">
              <LogOut size={24} />
            </span>
            <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
              Đăng xuất
            </span>
          </button>
        </div>

      </nav>
    </>
  )
}

export default AdminSidebar;