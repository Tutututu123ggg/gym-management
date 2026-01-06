"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useHomeRedirect() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    // Chỉ chạy khi đã tải xong và người dùng đã đăng nhập
    if (!isLoading && isLoggedIn && user) {
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'STAFF':
          router.push('/staff/home');
          break;
        case 'TRAINER':
          router.push('/coach');
          break;
        // MEMBER: Không làm gì cả (ở lại trang chủ)
        default:
          break;
      }
    }
  }, [isLoading, isLoggedIn, user, router]);

  return { isLoading, isLoggedIn, user };
}