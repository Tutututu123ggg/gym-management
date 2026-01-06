"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { PlanWithPromo, UpsertPlanInput } from '@/types/admin/plan';
import { PlanCategory } from '@prisma/client';

interface PlanModalProps {
  isOpen: boolean;
  plan: PlanWithPromo | null;
  onClose: () => void;
  onSubmit: (data: UpsertPlanInput) => Promise<void>;
}

// Mock function (Replace with real one)
const uploadImageAction = async (formData: FormData): Promise<string | null> => {
    await new Promise(r => setTimeout(r, 1000));
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000";
};

export default function PlanModal({ isOpen, plan, onClose, onSubmit }: PlanModalProps) {
  if (!isOpen) return null;

  const [form, setForm] = useState<UpsertPlanInput>({
    id: plan?.id,
    name: plan?.name || '',
    category: plan?.category || 'GYM',
    price: plan?.price || 0,
    durationDays: plan?.durationDays || 30,
    desc: plan?.desc || '',
    isActive: plan?.isActive ?? true,
    image: plan?.image || ''
  });

  const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>(plan?.image ? 'URL' : 'FILE');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
        const formData = new FormData(); formData.append('file', file);
        const url = await uploadImageAction(formData); 
        if (url) setForm(prev => ({ ...prev, image: url })); else alert("Upload thất bại");
    } catch { alert("Lỗi upload"); } finally { setIsUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSubmit(form);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
           <h3 className="font-bold text-lg text-slate-800 dark:text-white">{plan ? "Cập nhật Gói" : "Tạo gói mới"}</h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-4">
                <div><label className="text-sm font-medium">Tên gói *</label><input type="text" className="input-std w-full mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><label className="text-sm font-medium">Loại</label><select className="input-std w-full mt-1" value={form.category} onChange={e => setForm({...form, category: e.target.value as PlanCategory})}><option value="GYM">GYM</option><option value="CLASS">Lớp học</option><option value="POOL">Bơi lội</option></select></div>
                <div className="grid grid-cols-2 gap-3">
                   <div><label className="text-sm font-medium">Giá (VND)</label><input type="number" className="input-std w-full mt-1" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required /></div>
                   <div><label className="text-sm font-medium">Hạn (Ngày)</label><input type="number" className="input-std w-full mt-1" value={form.durationDays} onChange={e => setForm({...form, durationDays: Number(e.target.value)})} required /></div>
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-sm font-medium">Ảnh minh họa</label>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-black/50">
                    <div className="flex gap-2 mb-3"><button type="button" onClick={() => setUploadMode('FILE')} className={`flex-1 text-xs py-1.5 rounded ${uploadMode === 'FILE' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Upload</button><button type="button" onClick={() => setUploadMode('URL')} className={`flex-1 text-xs py-1.5 rounded ${uploadMode === 'URL' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>URL</button></div>
                    {uploadMode === 'FILE' ? (<div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />{isUploading ? <span className="text-xs text-blue-500">Uploading...</span> : <span className="text-xs text-slate-400">Click chọn ảnh</span>}</div>) : (<input type="text" placeholder="https://..." className="input-std w-full text-xs" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />)}
                    {form.image && (<div className="mt-3 relative h-24 w-full rounded overflow-hidden"><Image src={form.image} alt="Preview" fill className="object-cover" /></div>)}
                </div>
             </div>
          </div>
          <div><label className="text-sm font-medium">Mô tả</label><textarea className="input-std w-full mt-1 h-20 resize-none" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} /></div>
          <div><label className="text-sm font-medium mb-2 block">Trạng thái</label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" checked={form.isActive} onChange={() => setForm({...form, isActive: true})} className="accent-green-600"/><span className="text-sm">Active</span></label><label className="flex items-center gap-2"><input type="radio" checked={!form.isActive} onChange={() => setForm({...form, isActive: false})} className="accent-slate-500"/><span className="text-sm">Inactive</span></label></div></div>
        </form>
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950"><button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:border-slate-700">Hủy</button><button onClick={handleSubmit} disabled={isSaving || isUploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Đang lưu..." : "Lưu gói"}</button></div>
      </div>
    </div>
  );
}