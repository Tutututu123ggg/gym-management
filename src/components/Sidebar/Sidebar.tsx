"use client";

import React, {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext'; 
import { useAuth } from '@/context/AuthContext'; 
import mainGymIcon from '@/assets/main-gym-icon.png'; 
import LoginModal from '../LoginModal/LoginModal';
// --- ICONS ---
type IconComponent = (props?: React.SVGProps<SVGSVGElement>) => React.JSX.Element;

const Icons: Record<string, IconComponent> = {
  // ... (Giữ nguyên các icon Menu, Close, Home, Plans, About, Profile, Progress, Payment, Feedback, Login, Logout) ...
  Menu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  Close: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Home: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  Plans: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><circle cx="12" cy="8" r="2"/></svg>,
  About: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Profile: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Progress: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>,
  Payment: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  Feedback: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Login: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>,
  Logout: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  
  // Icon Sáng/Tối
  Sun: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>,
  Moon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

interface MenuItem {
  name: string;
  icon: React.JSX.Element;
  href: string;
  protected?: boolean; 
}

const Sidebar = () => {
  const { isMobileOpen, toggleMobileSidebar, closeMobileSidebar } = useSidebar();
  const { isLoggedIn, logout, login } = useAuth();
  const pathname = usePathname();
  const router = useRouter(); // 2. Khởi tạo router
  const { theme, setTheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  // Danh sách menu (Giữ nguyên)
  const allMenuItems: MenuItem[] = [
    { name: 'Trang chủ', icon: <Icons.Home />, href: '/' },
    { name: 'Gói tập', icon: <Icons.Plans />, href: '/plans' },
    { name: 'Về chúng tôi', icon: <Icons.About />, href: '/about' },
    { name: 'Thông tin cá nhân', icon: <Icons.Profile />, href: '/profile', protected: true },
    { name: 'Tiến độ tập', icon: <Icons.Progress />, href: '/progress', protected: true },
    { name: 'Thanh toán', icon: <Icons.Payment />, href: '/billing', protected: true },
    { name: 'Gửi phản hồi', icon: <Icons.Feedback />, href: '/feedback', protected: true },
  ];

  const visibleMenuItems = allMenuItems.filter(item => {
    if (item.protected && !isLoggedIn) return false;
    return true;
  });

  const handleLogout = () => {
    logout();           // Xóa session
    router.push('/');   // Điều hướng về trang chủ
    router.refresh();   // (Tùy chọn) Refresh để reset UI sạch sẽ
  };

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      {/* Nút Hamburger (Mobile) */}
      {!isMobileOpen && (
        <button 
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-sidebar text-sidebar-foreground border border-sidebar-border rounded-md md:hidden hover:bg-sidebar-accent transition-colors duration-300"
          aria-label="Open Menu"
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
            <span className="font-bold text-xl ml-3 md:ml-0 transition-all duration-300 whitespace-nowrap overflow-hidden md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
               Gym Master
            </span>
          </div>
          <button onClick={closeMobileSidebar} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground md:hidden">
            <Icons.Close />
          </button>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 custom-scrollbar">
          {visibleMenuItems.map((item, index) => {
            const isActive = pathname === item.href;
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
                    {item.icon}
                  </span>
                  <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
                    {item.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* FOOTER: DARK MODE & AUTH */}
        <div className="border-t border-sidebar-border p-2 shrink-0 space-y-1">
          
          {/* --- NÚT TOGGLE SÁNG/TỐI (CỐ ĐỊNH CHỮ "GIAO DIỆN") --- */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3 rounded-md"
          >
            <span className="md:w-20 md:justify-center flex items-center justify-start shrink-0 text-yellow-500">
              {/* Vẫn giữ logic đổi icon bằng CSS class */}
              <Icons.Moon className="block dark:hidden" />
              <Icons.Sun className="hidden dark:block" />
            </span>
            
            {/* Chữ TĨNH: Không bao giờ thay đổi -> Không bao giờ nháy */}
            <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
              Giao diện
            </span>
          </button>

          {/* --- Auth Button --- */}
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3 rounded-md group/logout"
            >
              <span className="md:w-20 md:justify-center flex items-center justify-start shrink-0">
                <Icons.Logout />
              </span>
              <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
                Đăng xuất
              </span>
            </button>
          ) : (
            <button 
              // SỬA: Bấm vào thì set state mở Modal lên
              onClick={() => setIsLoginOpen(true)} 
              className="w-full flex items-center hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors relative overflow-hidden whitespace-nowrap px-4 md:px-0 py-3 rounded-md"
            >
              <span className="md:w-20 md:justify-center flex items-center justify-start shrink-0 text-primary">
                <Icons.Login />
              </span>
              <span className="ml-4 md:ml-0 font-medium transition-all duration-300 md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto">
                Đăng nhập
              </span>
            </button>
          )}
        </div>

      </nav>
    </>
  )
}

export default Sidebar;