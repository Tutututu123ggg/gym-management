import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext'; // Nhớ import SidebarContext
import TrainerSidebar from '@/components/sidebar1/TrainerSidebar';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
        <TrainerSidebar />
        <main className="flex-1 md:ml-20 transition-all duration-300 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}