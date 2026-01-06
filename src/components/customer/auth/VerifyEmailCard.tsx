"use client";

import React from 'react';
import Link from 'next/link';
import { useVerifyEmail } from '@/hooks/customer/useVerifyEmail';

export default function VerifyEmailCard() {
  // Sử dụng Hook
  const { status, message } = useVerifyEmail();

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-gray-800">
      
      {/* 1. LOADING */}
      {status === "loading" && (
        <div className="flex flex-col items-center animate-in fade-in">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Đang xử lý...</h2>
          <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      )}

      {/* 2. SUCCESS */}
      {status === "success" && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Xác Thực Thành Công!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          
          <Link 
            href="/" 
            className="inline-block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
          >
            Về Trang Chủ & Đăng Nhập
          </Link>
        </div>
      )}

      {/* 3. ERROR */}
      {status === "error" && (
        <div className="animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Xác Thực Thất Bại</h2>
          <p className="text-red-500 mb-6 font-medium">{message}</p>
          
          <Link 
            href="/" 
            className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 underline text-sm"
          >
            Quay về trang chủ
          </Link>
        </div>
      )}
    </div>
  );
}