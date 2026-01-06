"use client";
import React from 'react';
import { format } from 'date-fns';
import { MessageSquare, User, CheckCircle, Clock, Trash2, AlertCircle } from 'lucide-react';
import { FeedbackWithUser } from '@/types/admin/feedback';

interface FeedbackListProps {
  feedbacks: FeedbackWithUser[];
  loading: boolean;
  userRole: 'ADMIN' | 'STAFF';
  onReply: (fb: FeedbackWithUser) => void;
  onDelete: (id: string) => void;
}

export default function FeedbackList({ feedbacks, loading, userRole, onReply, onDelete }: FeedbackListProps) {
  if (loading) {
    return <div className="text-center py-10 text-slate-400">Đang tải dữ liệu...</div>;
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <MessageSquare className="mx-auto h-10 w-10 text-slate-300 mb-2" />
        <p className="text-slate-500">Chưa có phản hồi nào trong mục này.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {feedbacks.map((item) => (
        // CSS CHUẨN: p-6
        <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                {item.user.name?.[0]?.toUpperCase() || <User size={16} />}
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white text-sm">{item.user.name || "Ẩn danh"}</div>
                <div className="text-xs text-slate-500">{item.user.email}</div>
              </div>
            </div>

            {/* Status Badge & Time */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
              </span>
              {item.status === 'REPLIED' ? (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Đã xong
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> Chờ xử lý
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="ml-14">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{item.message}</p>

            {/* Preview Reply - CSS CHUẨN: p-5, mt-5 */}
            {item.reply && (
              <div className="mt-5 bg-slate-50 dark:bg-slate-950 p-5 rounded-lg border-l-4 border-green-500 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Phản hồi từ Admin/Staff:</span>
                {item.reply}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onReply(item)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
              >
                <MessageSquare size={16} /> {item.status === 'REPLIED' ? 'Sửa câu trả lời' : 'Trả lời ngay'}
              </button>

              {userRole === 'ADMIN' && (
                <button
                  onClick={() => onDelete(item.id)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Xóa phản hồi (Admin Only)"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}