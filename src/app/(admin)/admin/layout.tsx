import React from 'react';
import AdminSidebar from '@/components/sidebar/AdminSidebar';
import { SidebarProvider } from '@/context/SidebarContext';

export const metadata = {
  title: 'Admin Portal | Gym Master',
  description: 'Hệ thống quản lý phòng Gym',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* 👇 FIX: Thêm 'font-sans' vào đây để đồng bộ font chữ với bên Member */}
      <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
        
        <AdminSidebar />

        {/* Nội dung chính */}
        <main className="flex-1 p-4 md:p-8 w-full h-[100dvh] overflow-y-auto md:ml-20 transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto pb-20 md:pb-10"> 
             {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}