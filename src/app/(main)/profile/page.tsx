/**
 * -----------------------------------------------------------------------------
 * FILE: src/app/profile/page.tsx
 * * CẬP NHẬT GIAO DIỆN:
 * - Thêm ô Email (Read-only) để fix lỗi thiếu email.
 * - Custom lại thẻ Select (Giới tính) nhìn xịn hơn.
 * - Custom lại thẻ Date (Ngày sinh) style phẳng.
 * -----------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/actions/profile';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, login, isLoggedIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    // Nếu chưa đăng nhập -> Đá về trang chủ (hoặc mở modal login)
    if (!isLoggedIn) {
      router.push('/'); 
    }
  }, [isLoggedIn, router]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    gender: 'Khác', 
    dateOfBirth: '',
    email: '',
    role: '',
    createdAt: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user?.email) {
      const fetchData = async () => {
        const res = await getUserProfile(user.email);
        if (res.success && res.user) {
          let formattedDob = '';
          if (res.user.dateOfBirth) {
            formattedDob = new Date(res.user.dateOfBirth).toISOString().split('T')[0];
          }

          setFormData({
            name: res.user.name || '',
            phone: res.user.phone || '',
            address: res.user.address || '',
            bio: res.user.bio || '',
            gender: res.user.gender || 'Khác', 
            dateOfBirth: formattedDob,
            email: res.user.email,
            role: res.user.role,
            createdAt: new Date(res.user.createdAt).toLocaleDateString('vi-VN')
          });
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = new FormData();
    payload.append('email', formData.email);
    payload.append('name', formData.name);
    payload.append('phone', formData.phone);
    payload.append('address', formData.address);
    payload.append('bio', formData.bio);
    payload.append('gender', formData.gender);
    payload.append('dateOfBirth', formData.dateOfBirth);

    const res = await updateUserProfile(payload);

    if (res.success && res.user) {
      setMessage({ type: 'success', text: res.message });

      login(res.user);
    } else {
      setMessage({ type: 'error', text: res.message || "Lỗi cập nhật." });
    }
    setIsSaving(false);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  

  // Trong lúc chờ kiểm tra hoặc nếu chưa login thì không render nội dung nhạy cảm
  if (!isLoggedIn) {
    return null; // Hoặc return <LoadingSpinner />
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Hồ Sơ Của Tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- CỘT TRÁI (Card thông tin) --- */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center sticky top-24">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-blue-500/30 shadow-lg">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formData.name}</h2>
            <div className="mt-2">
               <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                 {formData.role}
               </span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-sm space-y-3">
              <div className="flex justify-between items-center group">
                <span className="text-gray-500 dark:text-gray-400">Giới tính:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{formData.gender}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-gray-500 dark:text-gray-400">Ngày sinh:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formData.dateOfBirth ? formData.dateOfBirth.split('-').reverse().join('/') : '--/--/----'}
                </span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-gray-500 dark:text-gray-400">Tham gia:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{formData.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI (Form Edit) --- */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-blue-500 pl-3">
                Cập Nhật Thông Tin
            </h3>
            
            {message && (
              <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- Email (Read Only) --- */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email đăng nhập <span className="text-xs text-gray-400 font-normal">(Không thể thay đổi)</span>
                 </label>
                 <div className="relative">
                    <input 
                        type="text" 
                        value={formData.email} 
                        readOnly
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed select-none pl-10"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        📧
                    </div>
                 </div>
              </div>

              {/* --- Tên & SĐT --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>

              {/* --- Giới tính & Ngày sinh (MODERN UI) --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Custom Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới tính</label>
                  <div className="relative">
                    <select 
                        value={formData.gender} 
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all"
                    >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                    {/* Icon mũi tên custom */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                {/* Styled Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày sinh</label>
                  <div className="relative">
                    <input 
                        type="date" 
                        value={formData.dateOfBirth} 
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all text-gray-700 dark:text-gray-300 dark:[color-scheme:dark]" 
                    />
                  </div>
                </div>
              </div>

              {/* --- Địa chỉ --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa chỉ</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              {/* --- Bio --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới thiệu</label>
                <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all" />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="submit" disabled={isSaving} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isSaving && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}