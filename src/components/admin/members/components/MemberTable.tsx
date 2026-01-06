"use client";
import React from 'react';
import { User, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { MemberWithDetails } from '@/types/admin/member';

interface Props {
  members: MemberWithDetails[];
  loading: boolean;
  userRole: 'ADMIN' | 'STAFF';
  onView: (m: MemberWithDetails) => void;
  onEdit: (m: MemberWithDetails) => void;
  onDelete: (m: MemberWithDetails) => void;
}

export default function MemberTable({ members, loading, userRole, onView, onEdit, onDelete }: Props) {
  if (loading) return <div className="p-8 text-center text-slate-400">Đang tải dữ liệu...</div>;
  if (members.length === 0) return <div className="p-8 text-center text-slate-400">Không tìm thấy hội viên nào.</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
       <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs uppercase font-semibold">
               <tr>
                  <th className="p-4">Hội viên</th>
                  <th className="p-4">Liên hệ</th>
                  <th className="p-4">Gói hiện tại</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Thao tác</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               {members.map((mem) => {
                  const activeSub = mem.subscriptions.find(s => s.isActive && new Date(s.endDate) >= new Date());
                  return (
                     <tr key={mem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                 {mem.name?.[0]?.toUpperCase() || <User size={16}/>}
                              </div>
                              <div>
                                 <div className="font-medium text-slate-800 dark:text-white text-sm">{mem.name || "Unknown"}</div>
                                 <div className="text-xs text-slate-500">MEMBER</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                           <div className="flex flex-col">
                              <span>{mem.email}</span>
                              <span className="text-xs opacity-70">{mem.phone || "---"}</span>
                           </div>
                        </td>
                        <td className="p-4 text-sm">
                           {activeSub ? <span className="font-medium text-slate-700 dark:text-slate-300">{activeSub.plan.name}</span> : <span className="text-slate-400 italic">--</span>}
                        </td>
                        <td className="p-4">
                           {activeSub ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide"><CheckCircle size={10} className="mr-1"/> Active</span>
                           ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide"><XCircle size={10} className="mr-1"/> Inactive</span>
                           )}
                        </td>
                        <td className="p-4 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <button onClick={() => onView(mem)} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"><Eye size={16} /></button>
                              <button onClick={() => onEdit(mem)} className="p-2 text-slate-400 hover:text-orange-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"><Edit size={16} /></button>
                              
                              {userRole === 'ADMIN' && (
                                  <button onClick={() => onDelete(mem)} disabled={!!activeSub} className={`p-2 rounded-lg transition-colors ${activeSub ? 'text-slate-200 cursor-not-allowed bg-slate-50 dark:bg-slate-900' : 'text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800'}`}>
                                    <Trash2 size={16} />
                                  </button>
                              )}
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
       </div>
    </div>
  );
}