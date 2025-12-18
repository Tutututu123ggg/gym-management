"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // 👈 1. Import Router
import { useAuth } from '@/context/AuthContext';
import { loginUser, registerUser } from "@/actions/auth"; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const router = useRouter(); // 👈 2. Khởi tạo router
  const { login } = useAuth();

  // --- STATE QUẢN LÝ ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;

  // --- XỬ LÝ SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (isRegistering) formData.append("name", name);

    try {
      if (isRegistering) {
        // --- ĐĂNG KÝ ---
        const res = await registerUser(formData);
        
        if (res.success) {
          alert("Đăng ký thành công! Vui lòng đăng nhập.");
          setIsRegistering(false); 
          setPassword(""); 
        } else {
          setError(res.message || "Đăng ký thất bại");
        }

      } else {
        // --- ĐĂNG NHẬP ---
        const res = await loginUser(formData);
        
        if (res.success && res.user) {
          // 1. Lưu user vào Context
          login(res.user); 
          
          // 2. Đóng Modal
          onClose(); 

          // 👇 3. KIỂM TRA ROLE ĐỂ CHUYỂN HƯỚNG
          // Nếu là ADMIN -> Chuyển sang trang Admin (sẽ load AdminSidebar)
          // Nếu là MEMBER -> Giữ nguyên hoặc về trang chủ
          if (res.user.role === 'ADMIN') {
            router.push('/admin/dashboard'); 
          } else {
            router.push('/progress');  // Làm mới trang để cập nhật UI header
          }

        } else {
          setError(res.message || "Email hoặc mật khẩu không đúng");
        }
      }
    } catch (err) {
      setError("Lỗi kết nối Server, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RESET KHI CHUYỂN TAB ---
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-card-foreground">
            {isRegistering ? "Đăng Ký Hội Viên" : "Đăng Nhập"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-foreground mb-2">Họ và tên</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isRegistering && (
                <p className="text-xs text-muted-foreground mt-2 text-right hover:text-primary cursor-pointer">Quên mật khẩu?</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading && <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? "Đang xử lý..." : (isRegistering ? "Đăng Ký Ngay" : "Đăng Nhập")}
          </button>
        </form>

        <div className="px-8 py-4 bg-muted/50 border-t border-border text-center text-sm text-muted-foreground">
          {isRegistering ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <button 
            type="button"
            className="text-primary font-bold hover:underline"
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