"use client";
import React, { useState } from 'react';
import { X, Key, Eye, EyeOff } from 'lucide-react';
import { MemberWithDetails, UpdateMemberInput } from '@/types/admin/member';

interface Props {
  member: MemberWithDetails;
  userRole: 'ADMIN' | 'STAFF';
  onClose: () => void;
  onSubmit: (id: string, data: UpdateMemberInput) => Promise<any>;
  onChangePass: (id: string, pass: string) => Promise<any>;
}

export default function MemberEditModal({ member, userRole, onClose, onSubmit, onChangePass }: Props) {
  const [form, setForm] = useState<UpdateMemberInput>({
    name: member.name || '',
    phone: member.phone || '',
    address: member.address || '',
    bio: member.bio || ''
  });
  
  const [manualPassword, setManualPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(member.id, form);
    setSubmitting(false);
    onClose();
  };

  const handleChangePass = async () => {
     if (manualPassword.length < 6) return alert("Mật khẩu quá ngắn");
     if (!confirm("Đổi mật khẩu cho user này?")) return;
     
     setSubmitting(true);
     await onChangePass(member.id, manualPassword);
     setSubmitting(false);
     setManualPassword("");
     alert("Đổi mật khẩu thành công");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Cập nhật thông tin</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>
          
          <div className="p-6 space-y-8">
             <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide border-b border-blue-100 dark:border-blue-900 pb-1 mb-3">Thông tin chung</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-1"><label className="text-xs font-bold text-slate-500">Họ tên</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                   <div className="col-span-1"><label className="text-xs font-bold text-slate-500">SĐT</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                   <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Địa chỉ</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                   <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Bio / Ghi chú</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} /></div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors text-sm">Lưu thông tin</button>
             </form>

             {/* Admin Change Password Section */}
             {userRole === 'ADMIN' && (
                 <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Key size={16}/> Đổi mật khẩu</h4>
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 space-y-3">
                       <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Nhập mật khẩu mới để cấp lại cho khách hàng.</div>
                       <div className="relative">
                          <input type={showPassword ? "text" : "password"} className="w-full p-2.5 pr-10 border border-red-200 dark:border-red-900 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="Nhập mật khẩu mới..." value={manualPassword} autoComplete="new-password" onChange={(e) => setManualPassword(e.target.value)} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                       </div>
                       <button type="button" onClick={handleChangePass} disabled={!manualPassword || submitting} className="w-full py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 dark:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded font-bold transition-colors text-sm disabled:opacity-50">Cập nhật Mật khẩu</button>
                    </div>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
}