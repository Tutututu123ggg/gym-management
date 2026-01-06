import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext'; // Giả sử bạn có hook này
import { sendFeedbackAction, getMyFeedbacksAction } from '@/actions/customer/customer-feedback';
import { FeedbackItem, SendFeedbackInput } from '@/types/customer/customer-feedback';

export function useCustomerFeedback() {
  const { user, isLoggedIn } = useAuth();
  const userId = user?.id;

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load danh sách
  const loadFeedbacks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const res = await getMyFeedbacksAction(userId);
    if (res.success && res.data) {
        // Ép kiểu Date về string nếu cần thiết hoặc giữ nguyên
        setFeedbacks(res.data as any); 
    }
    setLoading(false);
  }, [userId]);

  // Tự động load khi user login
  useEffect(() => {
    if (isLoggedIn) loadFeedbacks();
  }, [isLoggedIn, loadFeedbacks]);

  // Gửi tin nhắn
  const send = async (data: SendFeedbackInput) => {
    if (!userId) return { success: false, message: "Vui lòng đăng nhập." };
    
    setSending(true);
    const res = await sendFeedbackAction(userId, data);
    setSending(false);
    
    if (res.success) {
      loadFeedbacks(); // Reload lại list sau khi gửi thành công
    }
    return res;
  };

  return {
    feedbacks,
    loading,
    sending,
    isLoggedIn,
    actions: { send, refresh: loadFeedbacks }
  };
}