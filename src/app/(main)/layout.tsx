// src/app/(main)/layout.tsx
import Sidebar from "@/components/Sidebar/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar /> {/* Sidebar của Khách */}
        <main className="flex-1 md:pl-20 transition-all duration-300">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}