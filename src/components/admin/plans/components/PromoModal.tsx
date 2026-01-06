"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PlanWithPromo } from '@/types/admin/plan';
import { format } from 'date-fns';

interface PromoModalProps {
  isOpen: boolean;
  plan: PlanWithPromo;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function PromoModal({ isOpen, plan, onClose, onSubmit }: PromoModalProps) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: `Sale ${format(new Date(), 'MM/yyyy')}`,
    salePrice: plan.price * 0.8,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
        ...form, 
        salePrice: Number(form.salePrice), 
        startDate: new Date(form.startDate), 
        endDate: new Date(form.endDate)
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-yellow-400/50">
         <div className="p-5 border-b bg-yellow-50 dark:bg-yellow-900/10 flex justify-between items-center">
            <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-500">Tạo khuyến mãi</h3>
            <button onClick={onClose}><X size={20}/></button>
         </div>
         <form onSubmit={handleSubmit} className="p-6 space-y-4">
             <div><label className="block text-sm mb-1">Tên KM</label><input className="input-std w-full" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/></div>
             <div><label className="block text-sm mb-1">Giá giảm (VNĐ)</label><input type="number" className="input-std w-full text-red-600 font-bold" value={form.salePrice} onChange={e => setForm({...form, salePrice: Number(e.target.value)})} required/></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1">Bắt đầu</label><input type="date" className="input-std w-full" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required/></div>
                <div><label className="block text-sm mb-1">Kết thúc</label><input type="date" className="input-std w-full" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required/></div>
             </div>
             <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="px-3 py-2 border rounded">Hủy</button><button type="submit" disabled={saving} className="px-3 py-2 bg-yellow-500 text-white rounded">{saving ? '...' : 'Áp dụng'}</button></div>
         </form>
      </div>
    </div>
  );
}