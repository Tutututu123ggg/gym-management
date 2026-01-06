"use client";
import React from 'react';
import { User as UserIcon, Save, Star, DollarSign, Calculator } from 'lucide-react';
import { StaffKPIResult, EditState } from '@/types/admin/staff';

interface Props {
  staffList: StaffKPIResult[];
  edits: Record<string, EditState>;
  loading: boolean;
  savingId: string | null;
  onInputChange: (id: string, field: keyof EditState, val: string | number) => void;
  onUseSuggestion: (staff: StaffKPIResult) => void;
  onSave: (staff: StaffKPIResult) => void;
}

export default function StaffTable({ staffList, edits, loading, savingId, onInputChange, onUseSuggestion, onSave }: Props) {
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                   <th className="p-4 w-[250px]">Nhân viên</th>
                   <th className="p-4 w-[100px]">Vai trò</th>
                   <th className="p-4 w-[160px]">Số buổi / Ca</th>
                   <th className="p-4 w-[180px]">Thưởng (VND)</th>
                   <th className="p-4 w-[120px]">Điểm KPI</th>
                   <th className="p-4">Ghi chú</th>
                   <th className="p-4 w-[80px] text-center">Lưu</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                   <tr><td colSpan={7} className="p-10 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                ) : staffList.length === 0 ? (
                   <tr><td colSpan={7} className="p-10 text-center text-slate-400">Không tìm thấy nhân viên.</td></tr>
                ) : staffList.map(staff => {
                   // Lấy giá trị hiển thị (Ưu tiên State Edits -> Data Server -> 0)
                   const kpiVal = edits[staff.id]?.kpi ?? staff.kpiData?.kpiScore ?? 0;
                   const sessVal = edits[staff.id]?.sessions ?? staff.kpiData?.sessions ?? 0;
                   const bonusVal = edits[staff.id]?.bonus ?? staff.kpiData?.bonus ?? 0;
                   const noteVal = edits[staff.id]?.notes ?? staff.kpiData?.notes ?? "";
                   
                   const isChanged = edits[staff.id] !== undefined;

                   return (
                      <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                         {/* INFO */}
                         <td className="p-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                  {staff.name?.[0]?.toUpperCase() || <UserIcon size={18}/>}
                               </div>
                               <div>
                                  <div className="font-bold text-slate-800 dark:text-white text-sm">{staff.name || "Unknown"}</div>
                                  <div className="text-xs text-slate-500">{staff.department || staff.email}</div>
                               </div>
                            </div>
                         </td>

                         {/* ROLE */}
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${staff.role === 'TRAINER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                               {staff.role}
                            </span>
                         </td>

                         {/* SESSIONS */}
                         <td className="p-4">
                            <div className="flex items-center gap-2">
                               <input type="number" className="input-std w-16 text-center h-9 font-medium" value={sessVal} onChange={(e) => onInputChange(staff.id, 'sessions', e.target.value)} />
                               {staff.role === 'TRAINER' && staff.suggestedSessions !== Number(sessVal) && (
                                  <button onClick={() => onUseSuggestion(staff)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title={`Hệ thống đếm được ${staff.suggestedSessions} lớp.`}>
                                     <Calculator size={14}/><span className="text-[10px] ml-1 font-bold">{staff.suggestedSessions}</span>
                                  </button>
                               )}
                            </div>
                         </td>

                         {/* BONUS */}
                         <td className="p-4">
                            <div className="relative">
                               <DollarSign size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
                               <input type="number" className="input-std w-32 pl-8 h-9 font-medium" placeholder="0" value={bonusVal} onChange={(e) => onInputChange(staff.id, 'bonus', e.target.value)} />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 pl-1 font-mono">{formatCurrency(Number(bonusVal))}</div>
                         </td>

                         {/* KPI */}
                         <td className="p-4">
                            <div className="flex items-center gap-1">
                               <input type="number" 
                                  className={`input-std w-16 text-center h-9 font-bold ${kpiVal >= 90 ? 'text-green-600 border-green-200' : kpiVal >= 70 ? 'text-blue-600 border-blue-200' : 'text-red-600 border-red-200'}`}
                                  value={kpiVal} onChange={(e) => onInputChange(staff.id, 'kpi', e.target.value)} max={100} min={0}
                               />
                               <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                            </div>
                         </td>

                         {/* NOTES */}
                         <td className="p-4">
                            <input type="text" className="input-std w-full h-9" placeholder="Nhập đánh giá..." value={noteVal} onChange={(e) => onInputChange(staff.id, 'notes', e.target.value)} />
                         </td>

                         {/* SAVE BUTTON */}
                         <td className="p-4 text-center">
                            <button 
                               onClick={() => onSave(staff)}
                               disabled={savingId === staff.id || (!isChanged && staff.kpiData !== null)}
                               className={`p-2 rounded-lg transition-all shadow-sm flex items-center justify-center mx-auto ${isChanged ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 disabled:opacity-50'}`}
                               title="Lưu đánh giá"
                            >
                               {savingId === staff.id ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Save size={18}/>}
                            </button>
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