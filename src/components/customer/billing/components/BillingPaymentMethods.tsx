"use client";
import React, { useState } from 'react';
import { PaymentMethod } from '@/types/customer/billing';
import { Icons, PaginationControls, GhostRows } from './Shared';

interface Props {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (data: { last4: string; brand: string; holder: string }) => Promise<void>;
  onRemove: (id: string) => Promise<any>;
}

export default function BillingPaymentMethods({ methods, selectedId, onSelect, onAdd, onRemove }: Props) {
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', holder: '', exp: '', cvc: '' });
  
  const ITEMS_PER_PAGE = 2;
  const HEIGHT = "h-[60px]";

  const totalPages = Math.ceil(methods.length / ITEMS_PER_PAGE);
  const visibleItems = methods.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    setNewCard(prev => ({ ...prev, exp: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const last4 = newCard.number.slice(-4) || '1234';
    await onAdd({ last4, brand: 'Visa', holder: newCard.holder });
    setIsAdding(false);
    setNewCard({ number: '', holder: '', exp: '', cvc: '' });
  };

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Icons.CreditCard /> Phương thức thanh toán</h2>
        
        <div className="space-y-3 mb-6">
            {visibleItems.map((pm) => (
                <div key={pm.id} className={`${HEIGHT} flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 group cursor-pointer hover:border-blue-300 transition-colors`} onClick={() => onSelect(pm.id)}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-5 bg-blue-900 rounded-sm"></div>
                        <div><div className="text-sm font-bold">•••• {pm.cardLast4}</div><div className="text-xs text-gray-500">{pm.cardBrand}</div></div>
                    </div>
                    <div className="flex items-center gap-2">
                        {pm.isDefault && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Mặc định</span>}
                        {selectedId === pm.id && <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>}
                        <button onClick={(e) => { e.stopPropagation(); onRemove(pm.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"><Icons.Trash /></button>
                    </div>
                </div>
            ))}
            {methods.length > 0 && <GhostRows count={ITEMS_PER_PAGE - visibleItems.length} height={HEIGHT} />}
            {methods.length === 0 && <p className="text-sm text-gray-500 italic text-center flex items-center justify-center h-[60px]">Chưa có thẻ nào được lưu.</p>}
        </div>
        
        <PaginationControls current={page} total={totalPages} onChange={setPage} />

        {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors font-medium text-sm cursor-pointer">+ Thêm thẻ mới</button>
        ) : (
            <form onSubmit={handleAddSubmit} className="space-y-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg animate-in fade-in">
                <input className="w-full p-2 text-sm border rounded bg-white dark:bg-black" placeholder="Số thẻ (giả lập)" value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value})} required />
                <div className="flex gap-2">
                        <input className="w-1/2 p-2 text-sm border rounded bg-white dark:bg-black" placeholder="MM/YY" value={newCard.exp} onChange={handleExpiryChange} maxLength={5} required />
                        <input className="w-1/2 p-2 text-sm border rounded bg-white dark:bg-black" placeholder="CVC" value={newCard.cvc} onChange={e => setNewCard({...newCard, cvc: e.target.value})} maxLength={4} required />
                </div>
                <input className="w-full p-2 text-sm border rounded bg-white dark:bg-black" placeholder="Tên chủ thẻ" value={newCard.holder} onChange={e => setNewCard({...newCard, holder: e.target.value})} required />
                <div className="flex gap-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-1 text-xs text-gray-500 cursor-pointer hover:bg-gray-200 rounded">Huỷ</button>
                    <button type="submit" className="flex-1 py-1 text-xs bg-blue-600 text-white rounded shadow cursor-pointer hover:bg-blue-700">Lưu thẻ</button>
                </div>
            </form>
        )}
    </div>
  );
}