"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Định nghĩa kiểu dữ liệu User cho khớp với Prisma/Database
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string; // 'MEMBER' | 'ADMIN' | 'TRAINER'
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  // Sửa: Hàm login nhận vào cả object User (từ backend trả về)
  login: (userData: User) => void; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check LocalStorage khi F5
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("gym_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Lỗi đọc localStorage:", error);
      // Nếu dữ liệu lỗi, xóa luôn để tránh crash
      localStorage.removeItem("gym_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Hàm Login (Lưu user thật từ DB vào Context & LocalStorage)
  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("gym_user", JSON.stringify(userData));
  };

  // 3. Hàm Logout
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("gym_user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};