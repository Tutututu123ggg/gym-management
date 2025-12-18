// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Dùng Inter thay cho Geist để tránh lỗi build
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeProvider";

// Cấu hình font Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gym Master",
  description: "Hệ thống phòng tập",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      {/* Áp dụng class của font Inter vào body */}
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Chỉ render children, Sidebar sẽ nằm ở layout con */}
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
