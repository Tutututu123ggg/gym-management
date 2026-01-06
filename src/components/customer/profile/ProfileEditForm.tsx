"use client";
import React, { useState, useEffect } from 'react';
import { UserProfileData } from '@/types/customer/user-profile';

interface Props {
  user: UserProfileData;
  isSaving: boolean;
  message: { type: 'success' | 'error', text: string } | null;
  onUpdate: (data: FormData) => Promise<void>;
}

export default function ProfileEditForm({ user, isSaving, message, onUpdate }: Props) {
  // Local state form để user nhập liệu
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', bio: '', gender: 'Khác', dateOfBirth: ''
  });

  // Sync data from props to state
  useEffect(() => {
    if (user) {
      let dob = '';
      if (user.dateOfBirth) {
        dob = new Date(user.dateOfBirth).toISOString().split('T')[0];
      }
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        gender: user.gender || 'Khác',
        dateOfBirth: dob
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('email', user.email); // Email để định danh (readonly)
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
    onUpdate(payload);
  };

  return (
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
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email đăng nhập <span className="text-xs text-gray-400 font-normal">(Không thể thay đổi)</span>
                </label>
                <div className="relative">
                    <input type="text" value={user.email} readOnly className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-transparent text-gray-500 dark:text-gray-400 cursor-not-allowed select-none pl-10" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-std" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-std" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới tính</label>
                    <div className="relative">
                        <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="input-std appearance-none cursor-pointer">
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày sinh</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="input-std text-gray-700 dark:text-gray-300 dark:[color-scheme:dark]" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa chỉ</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input-std" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới thiệu</label>
                <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="input-std resize-none" />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="submit" disabled={isSaving} className="btn-primary px-8 py-3.5 shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95">
                    {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
            </div>
        </form>
    </div>
  );
}