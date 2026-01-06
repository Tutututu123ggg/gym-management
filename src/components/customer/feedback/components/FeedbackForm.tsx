"use client";
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { SendFeedbackInput } from '@/types/customer/customer-feedback';

interface Props {
  onSend: (data: SendFeedbackInput) => Promise<any>;
  isSending: boolean;
}

export default function FeedbackForm({ onSend, isSending }: Props) {
  const [form, setForm] = useState({ title: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await onSend(form);
    if (res.success) {
        setForm({ title: '', message: '' });
        alert(res.message);
    } else {
        alert(res.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8 border border-slate-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Gửi phản hồi mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Tiêu đề / Chủ đề</label>
                <input 
                    type="text" required placeholder="VD: Lỗi thanh toán..."
                    className="input-std" // Dùng class chung nếu có, hoặc full class như cũ
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Nội dung chi tiết</label>
                <textarea 
                    required rows={5} placeholder="Mô tả vấn đề..."
                    className="input-std resize-none"
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                />
            </div>
            <button 
                type="submit" disabled={isSending || !form.title || !form.message}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
                {isSending ? <span className="animate-pulse">Đang gửi...</span> : <><Send size={16}/> Gửi Phản Hồi</>}
            </button>
        </form>
    </div>
  );
}