"use client";

import React, { useState } from 'react';
import { useFeedback } from '@/hooks/admin/useFeedback';
import { FeedbackWithUser } from '@/types/admin/feedback';

// Import các component nhỏ (Đã tách theo ISP)
import FeedbackFilters from './components/FeedbackFilters';
import FeedbackList from './components/FeedbackList';
import PaginationControl from './components/PaginationControl';
import ReplyModal from './components/ReplyModal';

interface FeedbackManagerProps {
  userRole: 'ADMIN' | 'STAFF';
}

export default function FeedbackManager({ userRole }: FeedbackManagerProps) {
  // Logic Layer
  const { feedbacks, loading, pagination, filter, setFilter, changePage, replyFeedback, deleteFeedback } = useFeedback();

  // Local State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null);

  // Handlers
  const handleDelete = async (id: string) => {
    if (userRole !== 'ADMIN') return alert("Bạn không có quyền xóa phản hồi.");
    if (confirm("Bạn chắc chắn muốn xóa?")) {
      const res = await deleteFeedback(id);
      if (!res.success) alert(res.message);
    }
  };

  const handleReplySubmit = async (text: string) => {
    if (!selectedFeedback) return;
    const res = await replyFeedback(selectedFeedback.id, text);
    if (res.success) {
      alert(res.message);
      setSelectedFeedback(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 h-full pb-20 px-6 bg-gray-50 dark:bg-gray-900">
      
      {/* Header */}
      <div className="pt-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {userRole === 'ADMIN' ? 'Quản Lý Phản Hồi' : 'Chăm Sóc Khách Hàng'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {userRole === 'ADMIN' 
            ? 'Tiếp nhận, xử lý và xóa các ý kiến đóng góp.' 
            : 'Tiếp nhận và giải quyết ý kiến đóng góp từ hội viên.'}
        </p>
      </div>

      {/* Các Component con độc lập (ISP) */}
      <FeedbackFilters 
        currentFilter={filter} 
        onChange={setFilter} 
      />

      <FeedbackList 
        feedbacks={feedbacks}
        loading={loading}
        userRole={userRole}
        onReply={setSelectedFeedback}
        onDelete={handleDelete}
      />

      <PaginationControl 
        pagination={pagination} 
        onPageChange={changePage} 
      />

      {selectedFeedback && (
        <ReplyModal 
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  );
}