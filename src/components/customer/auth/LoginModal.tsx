"use client";

import React from 'react';
import { useAuthForm } from '@/hooks/customer/useAuthForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  // Gọi Hook logic
  const { 
    isRegistering, formData, error, isLoading, 
    toggleMode, handleChange, handleSubmit 
  } = useAuthForm(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-border animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">
            {isRegistering ? "Đăng Ký Hội Viên" : "Đăng Nhập"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-muted-foreground dark:hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 dark:bg-destructive/10 dark:border-destructive/20 dark:text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">Họ và tên</label>
              <input 
                type="text" required
                className="input-std" // Dùng class chung input-std mình đã tạo ở globals.css
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">Email</label>
            <input 
              type="email" required
              className="input-std"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">Mật khẩu</label>
            <input 
              type="password" required
              className="input-std"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            {!isRegistering && (
                <p className="text-xs text-gray-500 mt-2 text-right hover:text-blue-600 cursor-pointer dark:text-muted-foreground dark:hover:text-primary">Quên mật khẩu?</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground"
          >
            {isLoading && <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? "Đang xử lý..." : (isRegistering ? "Đăng Ký Ngay" : "Đăng Nhập")}
          </button>
        </form>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500 dark:bg-muted/50 dark:border-border dark:text-muted-foreground">
          {isRegistering ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <button 
            type="button"
            className="text-blue-600 font-bold hover:underline dark:text-primary"
            onClick={toggleMode}
          >
            {isRegistering ? "Đăng nhập ngay" : "Đăng ký hội viên"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;