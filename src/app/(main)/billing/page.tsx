"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { 
  getBillingData, 
  addPaymentMethod, 
  payInvoice, 
  toggleAutoRenew, 
  createRenewalInvoice,
  cancelSubscription,
  removePaymentMethod
} from '@/actions/billing';

// --- TYPES ---
interface Plan {
    id: string;
    name: string;
    price: number;
    durationDays: number;
}

interface Subscription {
    id: string;
    isActive: boolean;
    autoRenew: boolean;
    startDate: Date | string;
    endDate: Date | string;
    plan: Plan; 
}

interface Invoice {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
    createdAt: Date | string;
    dueDate: Date | string;
    subscriptionId: string;
    subscription: {
        plan: Plan;
    }; 
}

interface PaymentMethod {
    id: string;
    cardLast4: string;
    cardBrand: string;
    isDefault: boolean;
    holderName: string;
}

interface BillingData {
    subscriptions: Subscription[];
    paymentMethods: PaymentMethod[];
    invoices: Invoice[];
}

// --- ICONS ---
const Icons = {
  CreditCard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>,
  XCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
};

// --- HELPER: Tính số hàng trống cần lấp ---
const getEmptyRows = (currentCount: number, maxPerPage: number) => {
    return Math.max(0, maxPerPage - currentCount);
};

export default function BillingPage() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu chưa đăng nhập -> Đá về trang chủ (hoặc mở modal login)
    if (!isLoggedIn) {
      router.push('/'); 
    }
  }, [isLoggedIn, router]);
  //const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<BillingData>({ subscriptions: [], paymentMethods: [], invoices: [] });
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCard, setSelectedCard] = useState<string>('');

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', holder: '', exp: '', cvc: '' });

  // --- CONFIG PHÂN TRANG (TÙY CHỈNH THEO YÊU CẦU) ---
  const PENDING_ITEMS_PER_PAGE = 5; // Mặc định
  const SUB_ITEMS_PER_PAGE = 3;     // Yêu cầu: 3 bản ghi/trang
  const PAYMENT_ITEMS_PER_PAGE = 2; // Yêu cầu: 2 bản ghi/trang
  const HISTORY_ITEMS_PER_PAGE = 5; // Yêu cầu: 6 bản ghi/trang

  // --- STATE PAGINATION ---
  const [pendingPage, setPendingPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getBillingData(user.id) as BillingData;
      setData(res);
      
      if (res.paymentMethods.length > 0) {
        const defaultCard = res.paymentMethods.find(pm => pm.isDefault);
        setSelectedCard(prev => prev || (defaultCard ? defaultCard.id : res.paymentMethods[0].id));
      } else {
        setSelectedCard('');
      }
    } catch (error) {
      console.error("Failed to load billing data", error);
    }
  }, [user?.id]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // --- HANDLERS (Giữ nguyên) ---
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setNewCard(prev => ({ ...prev, exp: value }));
  };

  const handlePay = async () => {
    if (!selectedInvoice || !selectedCard) return alert("Vui lòng chọn hóa đơn và phương thức thanh toán");
    setLoading(true);
    try {
        const res = await payInvoice(user!.id, selectedInvoice.id, selectedCard);
        alert(res.message);
        setSelectedInvoice(null);
        await loadData();
    } catch (error) {
        alert("Thanh toán thất bại");
    } finally {
        setLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const last4 = newCard.number.slice(-4) || '1234';
    await addPaymentMethod(user!.id, { last4, brand: 'Visa', holder: newCard.holder });
    setIsAddingCard(false);
    setNewCard({ number: '', holder: '', exp: '', cvc: '' });
    await loadData();
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thẻ này?")) return;
    setLoading(true);
    try {
        const res = await removePaymentMethod(user!.id, cardId);
        if (res.success) {
            if (selectedCard === cardId) setSelectedCard('');
            await loadData();
        } else {
            alert(res.message);
        }
    } catch (error) {
        alert("Lỗi khi xóa thẻ");
    } finally {
        setLoading(false);
    }
  };

  const handleRenewClick = async (subId: string) => {
      if(confirm("Bạn có muốn tạo hóa đơn gia hạn cho gói này không?")) {
          await createRenewalInvoice(user!.id, subId);
          await loadData();
      }
  }

  const handleCancelSub = async (subId: string) => {
    if(confirm("Bạn có chắc chắn muốn hủy gói đăng ký chưa thanh toán này không?")) {
        setLoading(true);
        const res = await cancelSubscription(subId);
        alert(res.message);
        await loadData();
        setLoading(false);
    }
  }

  const getDaysRemaining = (endDate: string | Date) => {
      return differenceInDays(new Date(endDate), new Date());
  };

  // --- LOGIC TÁCH DỮ LIỆU & PHÂN TRANG (CẬP NHẬT THEO CONFIG MỚI) ---
  
  // 1. Pending
  const pendingList = data.invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE');
  const totalPendingPages = Math.ceil(pendingList.length / PENDING_ITEMS_PER_PAGE);
  const visiblePendingItems = pendingList.slice((pendingPage - 1) * PENDING_ITEMS_PER_PAGE, pendingPage * PENDING_ITEMS_PER_PAGE);

  // 2. Subscriptions (3 items)
  const totalSubPages = Math.ceil(data.subscriptions.length / SUB_ITEMS_PER_PAGE);
  const visibleSubscriptions = data.subscriptions.slice((subPage - 1) * SUB_ITEMS_PER_PAGE, subPage * SUB_ITEMS_PER_PAGE);

  // 3. History (6 items)
  const historyList = data.invoices.filter(inv => inv.status !== 'PENDING' && inv.status !== 'OVERDUE');
  const totalHistoryPages = Math.ceil(historyList.length / HISTORY_ITEMS_PER_PAGE);
  const visibleHistoryItems = historyList.slice((historyPage - 1) * HISTORY_ITEMS_PER_PAGE, historyPage * HISTORY_ITEMS_PER_PAGE);

  // 4. Payment Methods (2 items)
  const totalPaymentPages = Math.ceil(data.paymentMethods.length / PAYMENT_ITEMS_PER_PAGE);
  const visiblePaymentMethods = data.paymentMethods.slice((paymentPage - 1) * PAYMENT_ITEMS_PER_PAGE, paymentPage * PAYMENT_ITEMS_PER_PAGE);

  // --- CONSTANTS CHO HEIGHT ---
  const SUB_ITEM_HEIGHT = "md:h-[100px]";
  const PAY_ITEM_HEIGHT = "h-[60px]";
  const HIST_ITEM_HEIGHT = "h-[65px]";

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="p-6 space-y-8 bg-slate-50 dark:bg-background min-h-screen text-foreground relative">
      <h1 className="text-2xl font-bold">💳 Quản lý Thanh toán & Dịch vụ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === CỘT TRÁI === */}
        <div className="space-y-6">
            
            {/* 1. HÓA ĐƠN CHỜ (Mặc định 5) */}
            {pendingList.length > 0 && (
                <div className="bg-white dark:bg-card border border-rose-200 dark:border-rose-900 rounded-xl p-5 shadow-sm animate-in slide-in-from-top-2">
                    <h2 className="font-bold text-rose-600 flex items-center gap-2 mb-4">
                        <Icons.Alert /> Cần thanh toán ({pendingList.length})
                    </h2>
                    
                    <div className="space-y-3">
                        {visiblePendingItems.map((inv) => (
                            <div key={inv.id} className="flex flex-col md:flex-row justify-between items-center bg-rose-50 dark:bg-rose-900/10 p-4 rounded-lg border border-rose-100 dark:border-rose-800">
                                <div>
                                    <div className="font-semibold">{inv.subscription.plan.name}</div>
                                    <div className="text-sm text-gray-500">Hạn chót: {format(new Date(inv.dueDate), 'dd/MM/yyyy')}</div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 md:mt-0">
                                    <span className="font-bold text-lg mr-2">{inv.amount.toLocaleString()} đ</span>
                                    <button onClick={() => setSelectedInvoice(inv)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer">Thanh toán</button>
                                    <button onClick={() => handleCancelSub(inv.subscriptionId)} className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer" title="Hủy đơn này"><Icons.Trash /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pendingList.length > PENDING_ITEMS_PER_PAGE && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-rose-100 dark:border-rose-800">
                            <span className="text-xs text-rose-500 font-medium">Trang {pendingPage} / {totalPendingPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPendingPage(prev => Math.max(prev - 1, 1))} disabled={pendingPage === 1} className="p-1.5 border border-rose-200 rounded hover:bg-rose-100 dark:hover:bg-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors text-rose-600"><Icons.ChevronLeft /></button>
                                <button onClick={() => setPendingPage(prev => Math.min(prev + 1, totalPendingPages))} disabled={pendingPage === totalPendingPages} className="p-1.5 border border-rose-200 rounded hover:bg-rose-100 dark:hover:bg-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors text-rose-600"><Icons.ChevronRight /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 2. GÓI DỊCH VỤ (3 ITEMS) */}
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col">
                <h2 className="font-bold text-lg mb-4">Gói dịch vụ của tôi</h2>
                <div className="space-y-4 mb-4">
                    {data.subscriptions.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-8">Bạn chưa đăng ký gói nào.</p>
                    ) : (
                        <>
                            {visibleSubscriptions.map((sub) => {
                                const daysLeft = getDaysRemaining(sub.endDate);
                                // Logic: Nếu active và còn ít hơn 7 ngày thì cho phép gia hạn sớm
                                const canRenewEarly = sub.isActive && daysLeft <= 7; 
                                // Logic: Nếu đã hết hạn (Inactive), hiển thị nút Mua lại
                                const isExpired = !sub.isActive;

                                return (
                                    <div 
                                        key={sub.id} 
                                        className="w-full h-auto md:h-[110px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                                    >
                                        {/* === PHẦN 1: THÔNG TIN === */}
                                        <div className="flex-1 min-w-0"> 
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                                <h3 className="font-bold text-base md:text-lg leading-snug break-words">
                                                    {sub.plan.name}
                                                </h3>
                                                {/* Badge trạng thái */}
                                                {sub.isActive ? 
                                                    <span className="shrink-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-green-200 dark:border-green-800">
                                                        Active
                                                    </span> :
                                                    <span className="shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-gray-200 dark:border-gray-700">
                                                        Đã hết hạn
                                                    </span>
                                                }
                                            </div>

                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1">
                                                <span>Hết hạn: <span className="font-medium text-foreground">{format(new Date(sub.endDate), 'dd/MM/yyyy')}</span></span>
                                                {sub.isActive && (
                                                    <span className={`text-xs ${daysLeft <= 7 ? 'text-rose-500 font-bold' : 'text-gray-400'}`}>
                                                        (Còn {daysLeft > 0 ? daysLeft : 0} ngày)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* === PHẦN 2: HÀNH ĐỘNG === */}
                                        <div className="
                                            flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 
                                            pt-3 mt-1 md:pt-0 md:mt-0 
                                            border-t border-gray-100 dark:border-gray-800 md:border-0
                                        ">
                                            {/* TRƯỜNG HỢP 1: ĐANG HOẠT ĐỘNG (ACTIVE) */}
                                            {sub.isActive && (
                                                <>
                                                    <div className="order-2 md:order-1">
                                                        {canRenewEarly ? (
                                                            // Nút Gia hạn sớm (khi sắp hết hạn)
                                                            <button onClick={() => handleRenewClick(sub.id)} className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                                            <Icons.Refresh /> <span>Gia hạn ngay</span>
                                                            </button>
                                                        ) : (
                                                            // Nút Hủy (khi đang dùng bình thường)
                                                            <button onClick={() => handleCancelSub(sub.id)} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                                <Icons.XCircle /> Hủy đăng ký
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Toggle Tự động gia hạn (Chỉ hiện khi Active) */}
                                                    <div className="order-1 md:order-2 flex items-center gap-2">
                                                        <span className="text-xs text-gray-400 hidden sm:inline">Tự động gia hạn:</span>
                                                        <span className="text-xs text-gray-400 sm:hidden">Gia hạn:</span>
                                                        <button 
                                                            onClick={async () => { await toggleAutoRenew(sub.id, sub.autoRenew); loadData(); }} 
                                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sub.autoRenew ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                                        >
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${sub.autoRenew ? 'translate-x-5' : 'translate-x-1'}`}/>
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {/* TRƯỜNG HỢP 2: ĐÃ HẾT HẠN (INACTIVE) */}
                                            {isExpired && (
                                                <div className="w-full md:w-auto flex justify-end">
                                                    <button 
                                                        onClick={() => handleRenewClick(sub.id)} 
                                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
                                                    >
                                                        <Icons.Refresh /> Đăng ký lại
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {/* GHOST ROWS: Dùng SUB_ITEMS_PER_PAGE (3) */}
                            {Array.from({ length: getEmptyRows(visibleSubscriptions.length, SUB_ITEMS_PER_PAGE) }).map((_, i) => (
                                <div key={`empty-sub-${i}`} className={`${SUB_ITEM_HEIGHT} border border-transparent`}></div>
                            ))}
                        </>
                    )}
                </div>

                {data.subscriptions.length > SUB_ITEMS_PER_PAGE && (
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500">Trang {subPage} / {totalSubPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setSubPage(prev => Math.max(prev - 1, 1))} disabled={subPage === 1} className="p-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"><Icons.ChevronLeft /></button>
                            <button onClick={() => setSubPage(prev => Math.min(prev + 1, totalSubPages))} disabled={subPage === totalSubPages} className="p-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"><Icons.ChevronRight /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* === CỘT PHẢI === */}
        <div className="space-y-6">
            
            {/* 3. PHƯƠNG THỨC THANH TOÁN (2 ITEMS) */}
            <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Icons.CreditCard /> Phương thức thanh toán
                </h2>
                
                <div className="space-y-3 mb-6">
                    {visiblePaymentMethods.map((pm) => (
                        <div key={pm.id} className={`${PAY_ITEM_HEIGHT} flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 group cursor-pointer hover:border-blue-300 transition-colors`} onClick={() => setSelectedCard(pm.id)}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-5 bg-blue-900 rounded-sm"></div>
                                <div>
                                    <div className="text-sm font-bold">•••• {pm.cardLast4}</div>
                                    <div className="text-xs text-gray-500">{pm.cardBrand}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {pm.isDefault && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Mặc định</span>}
                                {selectedCard === pm.id && <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCard(pm.id); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                    title="Xóa thẻ này"
                                >
                                    <Icons.Trash />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {/* GHOST ROWS: Dùng PAYMENT_ITEMS_PER_PAGE (2) */}
                    {data.paymentMethods.length > 0 && Array.from({ length: getEmptyRows(visiblePaymentMethods.length, PAYMENT_ITEMS_PER_PAGE) }).map((_, i) => (
                        <div key={`empty-pm-${i}`} className={`${PAY_ITEM_HEIGHT} border border-transparent`}></div>
                    ))}

                    {data.paymentMethods.length === 0 && <p className="text-sm text-gray-500 italic text-center flex items-center justify-center h-[60px]">Chưa có thẻ nào được lưu.</p>}
                </div>
                
                {data.paymentMethods.length > PAYMENT_ITEMS_PER_PAGE && (
                    <div className="flex justify-between items-center mb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500">Trang {paymentPage} / {totalPaymentPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPaymentPage(prev => Math.max(prev - 1, 1))} disabled={paymentPage === 1} className="p-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"><Icons.ChevronLeft /></button>
                            <button onClick={() => setPaymentPage(prev => Math.min(prev + 1, totalPaymentPages))} disabled={paymentPage === totalPaymentPages} className="p-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"><Icons.ChevronRight /></button>
                        </div>
                    </div>
                )}

                {!isAddingCard ? (
                    <button onClick={() => setIsAddingCard(true)} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors font-medium text-sm cursor-pointer">+ Thêm thẻ mới</button>
                ) : (
                    <form onSubmit={handleAddCard} className="space-y-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg animate-in fade-in">
                        <input className="w-full p-2 text-sm border rounded bg-white dark:bg-black" placeholder="Số thẻ (giả lập)" value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value})} required />
                        <div className="flex gap-2">
                             <input className="w-1/2 p-2 text-sm border rounded bg-white dark:bg-black" placeholder="MM/YY" value={newCard.exp} onChange={handleExpiryChange} maxLength={5} required />
                             <input className="w-1/2 p-2 text-sm border rounded bg-white dark:bg-black" placeholder="CVC" value={newCard.cvc} onChange={e => setNewCard({...newCard, cvc: e.target.value})} maxLength={4} required />
                        </div>
                        <input className="w-full p-2 text-sm border rounded bg-white dark:bg-black" placeholder="Tên chủ thẻ" value={newCard.holder} onChange={e => setNewCard({...newCard, holder: e.target.value})} required />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsAddingCard(false)} className="flex-1 py-1 text-xs text-gray-500 cursor-pointer hover:bg-gray-200 rounded">Huỷ</button>
                            <button type="submit" className="flex-1 py-1 text-xs bg-blue-600 text-white rounded shadow cursor-pointer hover:bg-blue-700">Lưu thẻ</button>
                        </div>
                    </form>
                )}
            </div>

             {/* 4. LỊCH SỬ THANH TOÁN (6 ITEMS) */}
             <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col min-h-[500px]">
                <h2 className="font-bold text-lg mb-4">Lịch sử giao dịch</h2>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500">
                            <tr>
                                <th className="p-3 rounded-l-lg">Ngày</th>
                                <th className="p-3">Dịch vụ</th>
                                <th className="p-3">Số tiền</th>
                                <th className="p-3 rounded-r-lg">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {visibleHistoryItems.length > 0 ? (
                                <>
                                    {visibleHistoryItems.map((inv) => (
                                        <tr key={inv.id} className={`${HIST_ITEM_HEIGHT} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
                                            <td className="p-3">{format(new Date(inv.createdAt), 'dd/MM/yyyy')}</td>
                                            <td className="p-3 font-medium">{inv.subscription.plan.name}</td>
                                            <td className="p-3">{inv.amount.toLocaleString()} đ</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* GHOST ROWS: Dùng HISTORY_ITEMS_PER_PAGE (6) */}
                                    {Array.from({ length: getEmptyRows(visibleHistoryItems.length, HISTORY_ITEMS_PER_PAGE) }).map((_, i) => (
                                        <tr key={`empty-hist-${i}`} className={HIST_ITEM_HEIGHT}>
                                            <td colSpan={4}></td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500 italic h-[400px] align-middle">Chưa có giao dịch hoàn tất</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {historyList.length > HISTORY_ITEMS_PER_PAGE && (
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500">Trang {historyPage} / {totalHistoryPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))} disabled={historyPage === 1} className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"><Icons.ChevronLeft /></button>
                            <button onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))} disabled={historyPage === totalHistoryPages} className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"><Icons.ChevronRight /></button>
                        </div>
                    </div>
                )}
             </div>

        </div>
      </div>

      {/* MODAL THANH TOÁN (Giữ nguyên) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                <h3 className="text-xl font-bold mb-1">Xác nhận thanh toán</h3>
                <p className="text-gray-500 text-sm mb-4">Bạn đang thanh toán cho dịch vụ: <span className="font-semibold text-foreground">{selectedInvoice.subscription.plan.name}</span></p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 flex justify-between items-center">
                    <span className="text-sm font-medium">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-blue-600">{selectedInvoice.amount.toLocaleString()} đ</span>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Chọn nguồn tiền:</label>
                    <div className="space-y-2">
                        {data.paymentMethods.map((pm) => (
                            <label key={pm.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedCard === pm.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'}`}>
                                <input 
                                    type="radio" name="card" 
                                    checked={selectedCard === pm.id} 
                                    onChange={() => setSelectedCard(pm.id)}
                                    className="accent-blue-600 w-4 h-4 cursor-pointer"
                                />
                                <div className="flex-1 text-sm font-medium">•••• {pm.cardLast4} ({pm.cardBrand})</div>
                            </label>
                        ))}
                        {data.paymentMethods.length === 0 && (
                            <p className="text-sm text-red-500">Bạn chưa có thẻ nào. Vui lòng thêm thẻ trước.</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setSelectedInvoice(null)} className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">Đóng</button>
                    <button onClick={handlePay} disabled={loading || !selectedCard} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all active:scale-95 cursor-pointer">{loading ? "Đang xử lý..." : "Thanh toán ngay"}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}