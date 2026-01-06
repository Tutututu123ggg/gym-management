"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSidebar } from '@/context/SidebarContext'; 
import { useAuth } from '@/context/AuthContext'; 
import mainGymIcon from '@/assets/main-gym-icon.png'; 
import { Users as IconUsers } from 'lucide-react';

// --- ICONS ---
type IconComponent = (props?: React.SVGProps<SVGSVGElement>) => React.JSX.Element;

const Icons: Record<string, IconComponent> = {
  // Common Icons
  Menu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  Close: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Logout: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Sun: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>,
  Moon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,

  // Trainer Specific Icons
  Dashboard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  Schedule: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
  Profile: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

interface MenuItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

const TrainerSidebar = () => {
  const { isMobileOpen, toggleMobileSidebar, closeMobileSidebar } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Menu riêng cho Trainer
  const trainerMenuItems: MenuItem[] = [
    { name: 'Dashboard', icon: Icons.Dashboard, href: '/coach' },
    { name: 'Quản lý Lịch dạy', icon: Icons.Schedule, href: '/coach/schedule' },
    // Đã thêm dấu '/' ở đầu để sửa lỗi 404
    { name: 'Học viên & Tiến độ', icon: IconUsers, href: '/coach/members' },
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
          <Icons.Menu />
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
        fixed top-0 left-0 h-screen 
        bg-sidebar text-sidebar-foreground border-r border-sidebar-border
        shadow-xl z-50 transition-all duration-300 ease-in-out 
        group w-64 md:w-20 md:hover:w-64 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
        flex flex-col
      `}>
        
        {/* HEADER */}
        <div className="h-20 md:h-24 border-b border-sidebar-border whitespace-nowrap overflow-hidden relative flex items-center px-4 md:px-0 shrink-0">
          <div className="flex items-center w-full">
            <div className="md:w-20 md:flex md:justify-center shrink-0">
               <div className="w-10 h-10 relative">
                 <Image src={mainGymIcon} alt="Gym Logo" fill className="object-contain" sizes="40px" />
               </div>
            </div>
            {/* Chữ Gym Master & Badge Trainer */}
            <div className="ml-3 md:ml-0 transition-all duration-300 whitespace-nowrap overflow-hidden md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto flex flex-col">
               <span className="font-bold text-xl leading-none">Gym Master</span>
               <span className="text-xs text-primary font-bold uppercase tracking-wider mt-1">Trainer Portal</span>
            </div>
          </div>
          <button onClick={closeMobileSidebar} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground md:hidden">
            <Icons.Close />
          </button>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 custom-scrollbar">
          {trainerMenuItems.map((item, index) => {
            const Icon = item.icon;

            // 👇 LOGIC FIX HIGHLIGHT DASHBOARD
            // Nếu item là Dashboard ('/coach'), chỉ active khi pathname chính xác là '/coach'
            // Các item khác (ví dụ '/coach/schedule') thì cho phép active khi vào trang con (ví dụ '/coach/schedule/edit')
            const isActive = 
                item.href === '/coach' 
                ? pathname === '/coach' 
                : (pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <div key={index}>
                 <Link 
                  href={item.href} 
                  className={`
                    flex items-center transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3
                    ${isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-sidebar-primary' 
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground border-l-4 border-transparent'}
                  `}
                >
                  <span className={`md:w-20 md:justify-center flex items-center justify-start shrink-0`}>
                    <Icon size={24} />
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
        <div className="border-t border-sidebar-border p-2 shrink-0 space-y-1">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3 rounded-md"
          >
            <span className="md:w-20 md:justify-center flex items-center justify-start shrink-0 text-yellow-500">
              <Icons.Moon className="block dark:hidden" />
              <Icons.Sun className="hidden dark:block" />
            </span>
            <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
              Giao diện
            </span>
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3 rounded-md"
          >
            <span className="md:w-20 md:justify-center flex items-center justify-start shrink-0">
              <Icons.Logout />
            </span>
            <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
              Đăng xuất
            </span>
          </button>
        </div>

      </nav>
    </>
  );
};

export default TrainerSidebar;