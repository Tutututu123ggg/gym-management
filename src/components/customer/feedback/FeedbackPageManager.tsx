"use client";

import React, { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCustomerFeedback } from '@/hooks/customer/useCustomerFeedback';

import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';

export default function FeedbackPageManager() {
  const { feedbacks, loading, sending, isLoggedIn, actions } = useCustomerFeedback();
  const router = useRouter();

  // Redirect nếu chưa login
  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-3 text-slate-800 dark:text-white">
                <MessageSquare className="text-blue-600" /> Trung Tâm Hỗ Trợ & Phản Hồi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                Gửi câu hỏi hoặc đóng góp ý kiến cho chúng tôi. Chúng tôi sẽ phản hồi sớm nhất có thể.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: Form */}
            <div className="lg:col-span-1">
                <FeedbackForm onSend={actions.send} isSending={sending} />
            </div>

            {/* Cột phải: List */}
            <FeedbackList feedbacks={feedbacks} loading={loading} />
        </div>
      </div>
    </div>
  );
}