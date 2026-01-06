"use client";
import React from 'react';
import { format } from 'date-fns';
import { EquipmentStatus } from '@prisma/client';
import { Edit, Trash2, CheckCircle, Wrench, XCircle, Image as ImageIcon } from 'lucide-react';
import { EquipmentWithDetails } from '@/types/admin/equipment';

interface Props {
  data: EquipmentWithDetails[];
  loading: boolean;
  userRole: 'ADMIN' | 'STAFF';
  onEdit: (item: EquipmentWithDetails) => void;
  onDelete: (id: string, code: string) => void;
}

const renderStatusBadge = (status: EquipmentStatus) => {
  switch (status) {
    case 'GOOD': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"><CheckCircle size={14}/> Tốt</span>;
    case 'MAINTENANCE': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"><Wrench size={14}/> Bảo trì</span>;
    case 'BROKEN': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"><XCircle size={14}/> Hỏng</span>;
  }
};

export default function EquipmentTable({ data, loading, userRole, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
             <tr>
               <th className="p-4 w-24">Mã</th>
               <th className="p-4">Tên & Loại</th>
               <th className="p-4">Vị trí</th>
               <th className="p-4 w-32">Trạng thái</th>
               <th className="p-4 w-32">Bảo trì</th>
               <th className="p-4 text-center w-24">Thao tác</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                  <td className="p-4"><div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full"></div></td>
                  <td colSpan={4} className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-slate-500">Không tìm thấy thiết bị nào.</td></tr>
            ) : data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                <td className="p-4"><span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">{item.code}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                     {item.image ? (
                       <img src={item.image} alt="" className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-700" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/> 
                     ) : (
                       <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><ImageIcon size={20}/></div>
                     )}
                     <div><div className="font-bold text-slate-800 dark:text-slate-200">{item.name}</div><div className="text-xs text-slate-500">{item.category.name}</div></div>
                  </div>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{item.category.room.name}</td>
                <td className="p-4">{renderStatusBadge(item.status)}</td>
                <td className="p-4 text-slate-500 text-xs">{item.lastMaintained ? format(new Date(item.lastMaintained), 'dd/MM/yyyy') : '-'}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit size={18} /></button>
                    {userRole === 'ADMIN' && (
                      <button 
                          onClick={() => item.status === 'BROKEN' && onDelete(item.id, item.code)} 
                          disabled={item.status !== 'BROKEN'} 
                          className={`p-2 rounded-lg transition-colors ${item.status === 'BROKEN' ? "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" : "text-slate-200 dark:text-slate-700 cursor-not-allowed"}`}
                      >
                          <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}