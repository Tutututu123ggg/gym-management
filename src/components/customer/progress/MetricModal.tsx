"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (height: string, weight: string) => Promise<void>;
}

export default function MetricModal({ isOpen, onClose, onSave }: MetricModalProps) {
  const [form, setForm] = useState({ height: '', weight: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) setForm({ height: '', weight: '' });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.height || !form.weight) return;
    
    setIsSaving(true);
    await onSave(form.height, form.weight);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  const bmiPreview = (form.height && form.weight) 
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(2)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
         <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cập nhật chỉ số</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
               <X size={20} />
            </button>
         </div>
         
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Chiều cao (cm)</label>
               <input 
                  type="number" 
                  placeholder="VD: 170" 
                  className="input-std font-medium"
                  value={form.height} 
                  onChange={(e) => setForm({...form, height: e.target.value})} 
                  required 
                  autoFocus
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cân nặng (kg)</label>
               <input 
                  type="number" 
                  step="0.1" 
                  placeholder="VD: 65.5" 
                  className="input-std font-medium"
                  value={form.weight} 
                  onChange={(e) => setForm({...form, weight: e.target.value})} 
                  required 
               />
            </div>

            {/* BMI Preview Card */}
            {bmiPreview && (
               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">BMI Dự tính</span>
                  <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
                     {bmiPreview}
                  </div>
               </div>
            )}

            <div className="flex gap-3 mt-6 pt-2">
               <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Huỷ bỏ</button>
               <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50">
                  {isSaving ? 'Đang lưu...' : 'Lưu chỉ số'}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}