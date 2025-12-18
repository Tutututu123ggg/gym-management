"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  MessageSquare, User, CheckCircle, Clock, Send, Trash2, 
  ChevronLeft, ChevronRight, X, AlertCircle 
} from 'lucide-react';

// Import Actions & Types
import { 
  getFeedbacks, 
  replyFeedback, 
  deleteFeedback, 
  type FeedbackWithUser, 
  type FeedbackFilterStatus 
} from '@/actions/admin-feedback';

export default function FeedbackPage() {
  // --- STATE WITH STRICT TYPES ---
  const [feedbacks, setFeedbacks] = useState<FeedbackWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination & Filter State
  const [filter, setFilter] = useState<FeedbackFilterStatus>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Modal Reply State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getFeedbacks(filter, page, 10);
      if (res.success && res.data && res.metadata) {
        setFeedbacks(res.data);
        setTotalPages(res.metadata.totalPages);
        setTotalRecords(res.metadata.total);
      } else {
        // Handle error case nicely if needed
        setFeedbacks([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filter or page changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // --- HANDLERS ---
  
  const openReplyModal = (fb: FeedbackWithUser) => {
    setSelectedFeedback(fb);
    setReplyText(fb.reply || ""); // Load old reply if exists
  };

  const handleSendReply = async () => {
    if (!selectedFeedback) return;
    if (!replyText.trim()) return alert("Vui lòng nhập nội dung!");
    
    setIsSubmitting(true);
    const res = await replyFeedback(selectedFeedback.id, replyText);
    setIsSubmitting(false);

    if (res.success) {
      alert(res.message);
      setSelectedFeedback(null);
      fetchData(); // Reload list to update status
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa phản hồi này?")) return;
    const res = await deleteFeedback(id);
    if (res.success) {
        fetchData();
    } else {
        alert(res.message);
    }
  };

  return (
    <div className="space-y-6 min-h-screen pb-20 p-6 bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Quản Lý Phản Hồi</h1>
        <p className="text-sm text-slate-500">Tiếp nhận và giải quyết ý kiến đóng góp từ hội viên.</p>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {(['ALL', 'PENDING', 'REPLIED'] as FeedbackFilterStatus[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setFilter(tabKey)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 
              ${filter === tabKey 
                ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            {tabKey === 'ALL' ? 'Tất cả' : (tabKey === 'PENDING' ? 'Chờ xử lý' : 'Đã trả lời')}
          </button>
        ))}
      </div>

      {/* LIST FEEDBACKS */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Đang tải dữ liệu...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <MessageSquare className="mx-auto h-10 w-10 text-slate-300 mb-2"/>
            <p className="text-slate-500">Chưa có phản hồi nào trong mục này.</p>
          </div>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-all group">
              <div className="flex justify-between items-start mb-3">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {item.user.name?.[0]?.toUpperCase() || <User size={16}/>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-sm">{item.user.name || "Ẩn danh"}</div>
                    <div className="text-xs text-slate-500">{item.user.email}</div>
                  </div>
                </div>
                
                {/* Status Badge & Time */}
                <div className="flex items-center gap-3">
                   <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12}/> {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
                   </span>
                   {item.status === 'REPLIED' ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={12}/> Đã xong
                      </span>
                   ) : (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1">
                        <AlertCircle size={12}/> Chờ xử lý
                      </span>
                   )}
                </div>
              </div>

              {/* Content */}
              <div className="ml-14">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{item.message}</p>
                 
                 {/* Preview Reply */}
                 {item.reply && (
                    <div className="mt-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border-l-4 border-green-500 text-sm text-slate-600 dark:text-slate-400">
                       <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Admin trả lời:</span> 
                       {item.reply}
                    </div>
                 )}

                 {/* Action Buttons */}
                 <div className="mt-4 flex gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openReplyModal(item)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                       <MessageSquare size={16}/> {item.status === 'REPLIED' ? 'Sửa câu trả lời' : 'Trả lời ngay'}
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Xóa phản hồi"
                    >
                       <Trash2 size={16}/>
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalRecords > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
           <span className="text-sm text-slate-500">Tổng: <span className="font-bold">{totalRecords}</span> phản hồi</span>
           <div className="flex gap-2 items-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page <= 1} 
                className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={16}/>
              </button>
              <span className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">Trang {page} / {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page >= totalPages} 
                className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
              >
                <ChevronRight size={16}/>
              </button>
           </div>
        </div>
      )}

      {/* --- REPLY MODAL --- */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="text-blue-500" size={20}/> Phản hồi ý kiến
                 </h3>
                 <button onClick={() => setSelectedFeedback(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={24}/></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                 {/* Khung chat: Câu hỏi của khách */}
                 <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-bold text-slate-500 uppercase">Khách hàng hỏi</span>
                       <span className="text-xs text-slate-400">• {format(new Date(selectedFeedback.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                       <h4 className="font-bold text-slate-800 dark:text-white mb-2">{selectedFeedback.title}</h4>
                       <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>
                 </div>

                 {/* Khung chat: Admin trả lời */}
                 <div>
                    <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2 block">Câu trả lời của bạn</label>
                    <textarea 
                       className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] resize-none"
                       placeholder="Nhập nội dung trả lời..."
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                 </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950 rounded-b-2xl">
                 <button 
                    onClick={() => setSelectedFeedback(null)} 
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                 >
                    Đóng
                 </button>
                 <button 
                    onClick={handleSendReply} 
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-all"
                 >
                    {isSubmitting ? 'Đang gửi...' : <><Send size={16}/> Gửi phản hồi</>}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}