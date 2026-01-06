"use client";
import React from 'react';
import { Key, X } from 'lucide-react'; // Nhớ import X nếu cần nút đóng

// Định nghĩa đúng Props cho Modal này
interface CredentialModalProps {
  info: { email: string; password: string };
  onClose: () => void;
}

export default function CredentialModal({ info, onClose }: CredentialModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border-2 border-green-500 relative">
          <button 
             onClick={onClose} 
             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
             <X size={24} />
          </button>

          <div className="text-center">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key size={32} />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Đăng ký thành công</h3>
             <p className="text-slate-500 mb-6 text-sm">Vui lòng cung cấp thông tin đăng nhập dưới đây cho khách hàng.</p>
             
             <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 text-left">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-slate-500 uppercase">Email</span>
                   <span className="font-mono font-bold text-slate-800 dark:text-white select-all">{info.email}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-2">
                   <span className="text-xs font-bold text-slate-500 uppercase">Mật khẩu mới</span>
                   <span className="font-mono font-bold text-xl text-blue-600 dark:text-blue-400 select-all tracking-wider">{info.password}</span>
                </div>
             </div>
             
             <button 
                onClick={onClose} 
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all"
             >
                Đã ghi lại thông tin
             </button>
          </div>
       </div>
    </div>
  );
}