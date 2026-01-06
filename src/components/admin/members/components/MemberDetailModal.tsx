"use client";
import React from 'react';
import { format } from 'date-fns';
import { X, CreditCard, Calendar } from 'lucide-react';
import { MemberWithDetails } from '@/types/admin/member';

interface Props {
  member: MemberWithDetails;
  onClose: () => void;
}

export default function MemberDetailModal({ member, onClose }: Props) {
  // Tính toán sơ bộ cho UI
  const totalCheckIns = 0; // Thay bằng dữ liệu thật nếu có
  const totalHours = 0;    // Thay bằng dữ liệu thật nếu có
  const currentStreak = 0; // Thay bằng dữ liệu thật nếu có
  const lastCheckIn = null; // Thay bằng dữ liệu thật nếu có

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
             <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
             <div className="flex gap-5 items-center">
                <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white/30">{member.name?.[0]?.toUpperCase()}</div>
                <div>
                   <h2 className="text-2xl font-bold">{member.name}</h2>
                   <div className="flex gap-2 text-blue-100 text-sm mt-1">
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider">MEMBER</span>
                      {member.phone && <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{member.phone}</span>}
                   </div>
                </div>
             </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
             <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800"><div className="text-xs text-slate-500 uppercase font-bold">Check-in</div><div className="text-lg font-bold text-slate-800 dark:text-white">{totalCheckIns}</div></div>
             <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800"><div className="text-xs text-slate-500 uppercase font-bold">Giờ tập</div><div className="text-lg font-bold text-slate-800 dark:text-white">{totalHours.toFixed(1)}h</div></div>
             <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800"><div className="text-xs text-slate-500 uppercase font-bold">Chuỗi</div><div className="text-lg font-bold text-orange-500">🔥 {currentStreak}</div></div>
             <div className="p-4 text-center"><div className="text-xs text-slate-500 uppercase font-bold">Lần cuối</div><div className="text-sm font-medium text-slate-800 dark:text-white mt-1">{lastCheckIn ? format(new Date(lastCheckIn), 'dd/MM HH:mm') : '--'}</div></div>
          </div>

          <div className="p-6 overflow-y-auto space-y-8 bg-white dark:bg-slate-900">
             <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                 <div><span className="text-slate-500 block text-xs">Email</span><span className="font-medium text-slate-800 dark:text-slate-200 break-all">{member.email}</span></div>
                 <div><span className="text-slate-500 block text-xs">SĐT</span><span className="font-medium text-slate-800 dark:text-slate-200">{member.phone || "---"}</span></div>
                 <div><span className="text-slate-500 block text-xs">Địa chỉ</span><span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={member.address || ""}>{member.address || "---"}</span></div>
                 <div className="col-span-2"><span className="text-slate-500 block text-xs">Ghi chú</span><p className="text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded mt-1 text-xs italic border border-slate-100 dark:border-slate-800">{member.bio || "Không có."}</p></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase flex items-center gap-2"><CreditCard size={16} className="text-green-500"/> Gói đăng ký</h4>
                   <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-left">
                         <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500"><tr><th className="p-2">Gói</th><th className="p-2">Hết hạn</th><th className="p-2">TT</th></tr></thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {member.subscriptions?.length > 0 ? member.subscriptions.map((sub) => (
                               <tr key={sub.id}><td className="p-2 font-medium">{sub.plan.name}</td><td className="p-2">{format(new Date(sub.endDate), 'dd/MM/yy')}</td><td className="p-2">{sub.isActive && new Date(sub.endDate) >= new Date() ? <span className="text-green-600 font-bold">Active</span> : <span className="text-slate-400">Hết</span>}</td></tr>
                            )) : <tr><td colSpan={3} className="p-3 text-center italic text-slate-400">Trống</td></tr>}
                         </tbody>
                      </table>
                   </div>
                </div>
                <div>
                   <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase flex items-center gap-2"><Calendar size={16} className="text-purple-500"/> Lớp đã học</h4>
                   <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-left">
                         <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500"><tr><th className="p-2">Lớp</th><th className="p-2">Ngày</th><th className="p-2">HLV</th></tr></thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {member.bookings?.length > 0 ? member.bookings.map((bk) => (
                               <tr key={bk.id}>
                                  <td className="p-2 font-medium">{bk.classSession.gymClass.name}</td>
                                  <td className="p-2">{format(new Date(bk.classSession.startTime), 'dd/MM')}</td>
                                  <td className="p-2 truncate max-w-[80px]">{bk.classSession.trainer?.name || "-"}</td>
                               </tr>
                            )) : <tr><td colSpan={3} className="p-3 text-center italic text-slate-400">Chưa học</td></tr>}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}