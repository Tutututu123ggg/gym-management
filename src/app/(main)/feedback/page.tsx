"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { sendFeedback, getMyFeedbacks } from '@/actions/feedback';
import { useRouter } from 'next/navigation';

// --- TYPES ---
interface FeedbackItem {
  id: string;
  title: string;
  message: string;
  reply: string | null;
  status: string;
  createdAt: Date | string;
}

// --- ICONS ---
const Icons = {
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
};

export default function FeedbackPage() {
  const { isLoggedIn, user } = useAuth();
  // 👇 FIX 1: Lấy userId ra biến riêng (Primitive string) để React dễ so sánh hơn là Object
  const userId = user?.id;

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // Nếu chưa đăng nhập -> Đá về trang chủ (hoặc mở modal login)
    if (!isLoggedIn) {
      router.push('/'); 
    }
  }, [isLoggedIn, router]);

  // Trong lúc chờ kiểm tra hoặc nếu chưa login thì không render nội dung nhạy cảm
  
  const [formData, setFormData] = useState({ title: '', message: '' });
  
  // 👇 FIX 2: Dùng useCallback chuẩn với dependency là userId
  // Chỉ khi 'userId' thay đổi thì hàm này mới được tạo lại
  const loadFeedbacks = useCallback(async () => {
    if (!userId) return; // Dùng userId thay vì user.id
    
    setLoading(true);
    try {
      const data = await getMyFeedbacks(userId) as FeedbackItem[];
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to load feedbacks", error);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Dependency khớp hoàn toàn với biến sử dụng bên trong

  // Effect để gọi hàm load khi userId thay đổi
  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  // Xử lý gửi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return alert("Vui lòng đăng nhập để gửi phản hồi.");
    
    setIsSending(true);
    // Dùng userId đã lấy ở trên
    const res = await sendFeedback(userId, formData);
    
    if (res.success) {
      setFormData({ title: '', message: '' });
      await loadFeedbacks(); 
    } else {
      alert(res.message);
    }
    setIsSending(false);
  };
  if (!isLoggedIn) {
    return null; 
  }
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-3">
                <Icons.MessageSquare /> Trung Tâm Hỗ Trợ & Phản Hồi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                Gửi câu hỏi hoặc đóng góp ý kiến cho chúng tôi. Chúng tôi sẽ phản hồi sớm nhất có thể.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: FORM GỬI TIN NHẮN */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8 border border-slate-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4">Gửi phản hồi mới</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Tiêu đề / Chủ đề</label>
                        <input 
                            type="text"
                            required
                            placeholder="VD: Lỗi thanh toán, Đề xuất tính năng..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Nội dung chi tiết</label>
                        <textarea 
                            required
                            rows={5}
                            placeholder="Mô tả chi tiết vấn đề của bạn..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isSending || !formData.title || !formData.message}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                    >
                        {isSending ? (
                            <span className="animate-pulse">Đang gửi...</span>
                        ) : (
                            <> <Icons.Send /> Gửi Phản Hồi </>
                        )}
                    </button>
                </form>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH LỊCH SỬ */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-2 flex items-center justify-between">
                <span>Lịch sử gửi tin</span>
                <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {feedbacks.length} tin nhắn
                </span>
            </h2>

            {loading ? (
                <div className="text-center py-10 text-slate-400">Đang tải dữ liệu...</div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-slate-300 dark:border-gray-700">
                    <p className="text-slate-500 font-medium">Bạn chưa gửi phản hồi nào.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            {/* Header tin nhắn */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 border-b border-slate-100 dark:border-gray-700 pb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <Icons.Clock /> {format(new Date(item.createdAt), "HH:mm - dd/MM/yyyy")}
                                    </div>
                                </div>
                                <div>
                                    {item.status === 'REPLIED' ? (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                            <Icons.CheckCircle /> Đã trả lời
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
                                            ⏳ Đang chờ xử lý
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Nội dung User gửi */}
                            <div className="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                                {item.message}
                            </div>

                            {/* Admin Trả lời (Chỉ hiện khi có reply) */}
                            {item.reply && (
                                <div className="ml-0 md:ml-8 relative">
                                    <div className="absolute top-0 left-0 -ml-4 mt-2 w-3 h-3 bg-slate-200 dark:bg-gray-600 rounded-full md:block hidden"></div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl rounded-tl-none">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">Quản trị viên</span>
                                            <span className="text-[10px] text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full">Support Team</span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-200 text-sm">
                                            {item.reply}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}