import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getBillingData, addPaymentMethod, payInvoice, 
  toggleAutoRenew, createRenewalInvoice, cancelSubscription, 
  removePaymentMethod 
} from '@/actions/customer/billing';
import { BillingData } from '@/types/customer/billing';
import { bookSession } from '@/actions/customer/booking';

export function useBilling() {
  const { user, isLoggedIn } = useAuth();
  
  const [data, setData] = useState<BillingData>({ subscriptions: [], paymentMethods: [], invoices: [] });
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Data
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      // setLoading(true) // Có thể bỏ qua loading state toàn cục để tránh flicker khi refresh nhẹ
      const res = await getBillingData(user.id) as BillingData;
      setData(res);
    } catch (error) {
      console.error("Lỗi tải billing:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = () => setRefreshKey(k => k + 1);

  // --- ACTIONS WRAPPERS ---

  const handlePayInvoice = async (invoiceId: string, cardId: string) => {
    if (!user?.id) return { success: false, message: "Chưa đăng nhập" };
    const res = await payInvoice(user.id, invoiceId, cardId);
    if (res.success) refresh();
    return res;
  };

  const handleAddCard = async (cardData: { last4: string, brand: string, holder: string }) => {
    if (!user?.id) return;
    await addPaymentMethod(user.id, cardData);
    refresh();
  };

  const handleRemoveCard = async (cardId: string) => {
    if (!user?.id) return { success: false };
    const res = await removePaymentMethod(user.id, cardId);
    if (res.success) refresh();
    return res;
  };

  const handleToggleAutoRenew = async (subId: string, currentStatus: boolean) => {
    await toggleAutoRenew(subId, currentStatus);
    refresh();
  };

  const handleRenewManual = async (subId: string) => {
    if (!user?.id) return;
    await createRenewalInvoice(user.id, subId);
    refresh();
  };

  const handleCancelSub = async (subId: string) => {
    const res = await cancelSubscription(subId);
    if (res.success) refresh();
    return res;
  };

  const handleBookSession = async (sessionId: string) => {
    if (!user?.id) return { success: false, message: "Chưa đăng nhập" };
    const res = await bookSession(user.id, sessionId);
    // Không cần refresh() toàn bộ billing data vì booking không ảnh hưởng bill, 
    // nhưng nếu bạn muốn cập nhật UI khác thì có thể gọi.
    return res;
  };

  return {
    data,
    loading,
    isLoggedIn,
    actions: {
      refresh,
      payInvoice: handlePayInvoice,
      addCard: handleAddCard,
      removeCard: handleRemoveCard,
      toggleAutoRenew: handleToggleAutoRenew,
      renewManual: handleRenewManual,
      cancelSub: handleCancelSub,
      bookSession: handleBookSession
    }
  };
}