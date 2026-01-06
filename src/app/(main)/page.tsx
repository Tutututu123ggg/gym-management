// app/(main)/page.tsx
"use client";

import React, { useState } from 'react';
import LoginModal from '@/components/customer/auth/LoginModal'; 
import LandingPage from '@/components/customer/home/LandingPage';
import { useHomeRedirect } from '@/hooks/admin/useHomeRedirect'; // Import hook logic
import { useRouter } from 'next/navigation';


export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoading, isLoggedIn, user } = useHomeRedirect();
  const router = useRouter();

  // 1. Trạng thái Loading
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Kiểm tra điều kiện hiển thị
  // Chỉ ẩn giao diện (để redirect) nếu: Đã Login VÀ Role KHÔNG PHẢI Member
  const isRedirecting = isLoggedIn && user?.role !== 'MEMBER';

  if (isRedirecting) {
    return null; 
  }

  // 3. Xử lý nút bấm trên Landing Page
  // Nếu Member đã login mà bấm nút -> Vào trang cá nhân (/progress)
  // Nếu chưa login -> Mở Modal
  const handleActionClick = () => {
    if (isLoggedIn && user?.role === 'MEMBER') {
        router.push('/progress');
    } else {
        setShowLoginModal(true);
    }
  };

  // 4. Hiển thị Landing Page (Cho Guest và Member)
  return (
    <>
      <LandingPage onLoginClick={handleActionClick} />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}