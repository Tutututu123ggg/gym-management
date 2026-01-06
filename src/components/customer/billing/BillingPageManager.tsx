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
import BookingModal from './components/BookingModal'; // Import Modal mới

export default function BillingPageManager() {
  const router = useRouter();
  const { data, isLoggedIn, actions } = useBilling();
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCard, setSelectedCard] = useState<string>('');
  
  // STATE MỚI: Quản lý việc hiển thị modal đăng ký lớp
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

  return (
    <div className="p-6 space-y-8 bg-slate-50 dark:bg-background min-h-screen text-foreground relative">
      <h1 className="text-2xl font-bold">💳 Quản lý Thanh toán & Dịch vụ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CỘT TRÁI */}
        <div className="space-y-6">
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
                // Truyền hàm mở modal
                onBookClass={(sub) => setBookingSub(sub)}
            />
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">
            <BillingPaymentMethods 
                methods={data.paymentMethods} 
                selectedId={selectedCard} 
                onSelect={setSelectedCard} 
                onAdd={actions.addCard} 
                onRemove={actions.removeCard}
            />
            <BillingHistory invoices={data.invoices} />
        </div>
      </div>

      {/* MODAL THANH TOÁN (Cũ) */}
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

      {/* MODAL ĐĂNG KÝ LỊCH (Mới) */}
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