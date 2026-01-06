"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PlanWithPromo, CreateMemberInput } from '@/types/admin/member';

interface Props {
  plans: PlanWithPromo[];
  onClose: () => void;
  onSubmit: (data: CreateMemberInput) => Promise<void>;
}

export default function MemberCreateModal({ plans, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<CreateMemberInput>({ name: '', email: '', phone: '', planId: '', paymentMethod: 'CASH' });
  const [submitting, setSubmitting] = useState(false);

  const selectedPlan = plans.find(p => p.id === form.planId);
  const activePromo = selectedPlan?.promotions.find(p => p.isActive && new Date() >= new Date(p.startDate) && new Date() <= new Date(p.endDate));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Đăng ký mới</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
             <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500">Email *</label>
                      <input type="email" required className="w-full p-2.5 mt-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
                      <p className="text-[10px] text-slate-400 mt-1 italic">* Hệ thống sẽ tự tìm hội viên cũ hoặc tạo tài khoản mới.</p>
                   </div>
                   <div className="col-span-1">
                      <label className="text-xs font-bold text-slate-500">Họ tên *</label>
                      <input type="text" required className="w-full p-2.5 mt-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                   </div>
                   <div className="col-span-1">
                      <label className="text-xs font-bold text-slate-500">SĐT</label>
                      <input type="text" className="w-full p-2.5 mt-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                   </div>
                </div>
             </div>

             <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-500 block mb-2">Chọn gói dịch vụ *</label>
                <select className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.planId} onChange={(e) => setForm({...form, planId: e.target.value})} required>
                   <option value="">-- Chọn gói --</option>
                   {plans.map(p => {
                      const promo = p.promotions.find(pr => pr.isActive && new Date() >= new Date(pr.startDate));
                      return <option key={p.id} value={p.id}>{p.name} {promo ? `(🔥 KM: ${promo.salePrice.toLocaleString()})` : `(${p.price.toLocaleString()})`}</option>
                   })}
                </select>
                
                {selectedPlan && (
                   <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex justify-between items-center text-sm">
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Thành tiền:</span>
                      <div className="flex flex-col items-end">
                         {activePromo ? (
                            <><span className="font-bold text-lg text-red-600">{activePromo.salePrice.toLocaleString()} VND</span><span className="text-xs text-slate-400 line-through">{selectedPlan.price.toLocaleString()} VND</span></>
                         ) : <span className="font-bold text-lg text-blue-700">{selectedPlan.price.toLocaleString()} VND</span>}
                      </div>
                   </div>
                )}
             </div>

             <div className="grid grid-cols-3 gap-3">
                {(['CASH', 'TRANSFER', 'POS'] as const).map(m => (
                   <button key={m} type="button" onClick={() => setForm({...form, paymentMethod: m})} className={`py-2 text-xs font-bold rounded-lg border transition-all ${form.paymentMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{m === 'CASH' ? 'Tiền mặt' : (m === 'TRANSFER' ? 'Chuyển khoản' : 'Quẹt thẻ')}</button>
                ))}
             </div>
             <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
                {submitting ? 'Đang xử lý...' : 'Xác nhận & Thu tiền'}
             </button>
          </form>
       </div>
    </div>
  );
}