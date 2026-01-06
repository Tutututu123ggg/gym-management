"use client";
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, X, Send } from 'lucide-react';
import { FeedbackWithUser } from '@/types/admin/feedback';

interface ReplyModalProps {
  feedback: FeedbackWithUser;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}

export default function ReplyModal({ feedback, onClose, onSubmit }: ReplyModalProps) {
  const [replyText, setReplyText] = useState<string>(feedback.reply || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSend = async () => {
    if (!replyText.trim()) return alert("Vui lòng nhập nội dung!");
    setIsSubmitting(true);
    await onSubmit(replyText);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" size={20} /> Phản hồi ý kiến
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Khách hàng hỏi</span>
              <span className="text-xs text-slate-400">• {format(new Date(feedback.createdAt), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">{feedback.title}</h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{feedback.message}</p>
            </div>
          </div>

          {/* Answer Input */}
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
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSend}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Đang gửi...' : <><Send size={16} /> Gửi phản hồi</>}
          </button>
        </div>
      </div>
    </div>
  );
}