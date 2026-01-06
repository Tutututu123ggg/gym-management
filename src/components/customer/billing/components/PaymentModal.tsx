"use client";
import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '@/types/customer/billing';

interface Props {
  invoice: Invoice;
  paymentMethods: PaymentMethod[];
  selectedCard: string;
  onSelectCard: (id: string) => void;
  onConfirm: () => Promise<any>;
  onClose: () => void;
}

export default function PaymentModal({ invoice, paymentMethods, selectedCard, onSelectCard, onConfirm, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
        await onConfirm();
        onClose();
    } catch {
        alert("Lỗi");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-1">Xác nhận thanh toán</h3>
            <p className="text-gray-500 text-sm mb-4">Bạn đang thanh toán cho dịch vụ: <span className="font-semibold text-foreground">{invoice.subscription.plan.name}</span></p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 flex justify-between items-center">
                <span className="text-sm font-medium">Tổng tiền:</span>
                <span className="text-2xl font-bold text-blue-600">{invoice.amount.toLocaleString()} đ</span>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Chọn nguồn tiền:</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {paymentMethods.map((pm) => (
                        <label key={pm.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedCard === pm.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'}`}>
                            <input type="radio" name="card" checked={selectedCard === pm.id} onChange={() => onSelectCard(pm.id)} className="accent-blue-600 w-4 h-4 cursor-pointer"/>
                            <div className="flex-1 text-sm font-medium">•••• {pm.cardLast4} ({pm.cardBrand})</div>
                        </label>
                    ))}
                    {paymentMethods.length === 0 && <p className="text-sm text-red-500">Bạn chưa có thẻ nào. Vui lòng thêm thẻ trước.</p>}
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">Đóng</button>
                <button onClick={handlePay} disabled={loading || !selectedCard} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all active:scale-95 cursor-pointer">{loading ? "Đang xử lý..." : "Thanh toán ngay"}</button>
            </div>
        </div>
    </div>
  );
}