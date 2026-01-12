"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '@/hooks/customer/useBilling';
import { Invoice, Subscription } from '@/types/customer/billing';

import BillingInvoices from './components/BillingInvoices';
import BillingSubscriptions from './components/BillingSubscriptions';
import BillingPaymentMethods from './components/BillingPaymentMethods';
import BillingHistory from './components/BillingHistory';
import PaymentModal from './components/PaymentModal';
import BookingModal from './components/BookingModal';
import { Icons } from './components/Shared'; // Giả sử Icons được export từ đây

export default function BillingPageManager() {
  const router = useRouter();
  const { data, isLoggedIn, actions } = useBilling();
  
  // STATE: Tabs management
  const [activeTab, setActiveTab] = useState<'services' | 'wallet'>('services');

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [bookingSub, setBookingSub] = useState<Subscription | null>(null);

  // Auto-select default card
  useEffect(() => {
    if (data.paymentMethods.length > 0 && !selectedCard) {
        const defaultCard = data.paymentMethods.find(pm => pm.isDefault);
        setSelectedCard(defaultCard ? defaultCard.id : data.paymentMethods[0].id);
    }
  }, [data.paymentMethods, selectedCard]);

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  // Render nội dung dựa trên Tab đang chọn
  const renderContent = () => {
    if (activeTab === 'services') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Nhóm 1: Thanh toán hóa đơn & Đăng ký lớp */}
          <BillingInvoices 
              invoices={data.invoices} 
              onPay={setSelectedInvoice} 
              onCancel={actions.cancelSub}
          />
          <BillingSubscriptions 
              subscriptions={data.subscriptions} 
              onRenew={actions.renewManual} 
              onCancel={actions.cancelSub} 
              onToggleAutoRenew={actions.toggleAutoRenew}
              onBookClass={(sub) => setBookingSub(sub)}
          />
        </div>
      );
    }

    if (activeTab === 'wallet') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
           {/* Nhóm 2: Phương thức thanh toán & Lịch sử */}
           {/* Cột trái (hoặc trên): Quản lý thẻ */}
           <div>
              <BillingPaymentMethods 
                  methods={data.paymentMethods} 
                  selectedId={selectedCard} 
                  onSelect={setSelectedCard} 
                  onAdd={actions.addCard} 
                  onRemove={actions.removeCard}
              />
           </div>
           
           {/* Cột phải (hoặc dưới): Lịch sử */}
           <div>
              <BillingHistory invoices={data.invoices} />
           </div>
        </div>
      );
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-background min-h-screen text-foreground relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            💳 Quản lý Dịch vụ
          </h1>
          
          {/* NAVIGATION TABS */}
          <div className="bg-white dark:bg-card p-1 rounded-xl border border-gray-200 dark:border-gray-800 flex shadow-sm w-full md:w-auto">
            <button 
                onClick={() => setActiveTab('services')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'services' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
                Gói & Đăng ký
            </button>
            <button 
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'wallet' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
                Ví & Lịch sử
            </button>
          </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="min-h-[500px]">
          {renderContent()}
      </div>

      {/* GLOBAL MODALS - Đặt ở ngoài để luôn sẵn sàng */}
      {selectedInvoice && (
        <PaymentModal 
            invoice={selectedInvoice} 
            paymentMethods={data.paymentMethods}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
            onClose={() => setSelectedInvoice(null)}
            onConfirm={() => actions.payInvoice(selectedInvoice.id, selectedCard)}
        />
      )}

      {bookingSub && (
        <BookingModal 
            planId={bookingSub.plan.id}
            planName={bookingSub.plan.name}
            onClose={() => setBookingSub(null)}
            onBook={actions.bookSession}
        />
      )}
    </div>
  );
}