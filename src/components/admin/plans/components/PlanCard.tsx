"use client";
import React from 'react';
import Image from 'next/image';
import { format, isAfter } from 'date-fns';
import { 
  Edit, Trash2, Tag, Layers, Package, Percent, PowerOff, 
  Calendar as CalIcon, Image as ImageIcon 
} from 'lucide-react';
import { PlanWithPromo } from '@/types/admin/plan';

interface PlanCardProps {
  plan: PlanWithPromo;
  userRole: 'ADMIN' | 'STAFF';
  onEdit: (p: PlanWithPromo) => void;
  onDelete: (id: string, count: number) => void;
  onPromo: (p: PlanWithPromo) => void;
  onStopPromo: (id: string) => void;
  onClassManager: (p: PlanWithPromo) => void;
}

export default function PlanCard({ 
  plan, userRole, onEdit, onDelete, onPromo, onStopPromo, onClassManager 
}: PlanCardProps) {
  
  const renderPrice = () => {
    if (plan.currentPromo && isAfter(new Date(plan.currentPromo.endDate), new Date())) {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600 text-xl">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.currentPromo.salePrice)}
            </span>
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center animate-pulse">
              <Percent size={10} className="mr-0.5"/> SALE
            </span>
          </div>
          <div className="text-xs text-slate-400 line-through">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
          </div>
          <div className="text-[10px] text-blue-600 mt-1 font-medium">
            CT: {plan.currentPromo.name} (đến {format(new Date(plan.currentPromo.endDate), 'dd/MM')})
          </div>
        </div>
      );
    }
    return (
      <span className="font-bold text-slate-800 dark:text-white text-xl">
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
      </span>
    );
  };

  return (
    <div className={`relative bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm hover:shadow-md transition-all group ${!plan.isActive ? 'border-slate-200 opacity-60 grayscale' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="absolute top-4 right-4">
        {!plan.isActive && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-300">Đã ẩn</span>}
      </div>
      
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-3 rounded-lg overflow-hidden relative shrink-0 w-16 h-16 flex items-center justify-center ${plan.image ? 'bg-transparent' : (plan.category === 'GYM' ? 'bg-blue-50 text-blue-600' : plan.category === 'CLASS' ? 'bg-purple-50 text-purple-600' : 'bg-cyan-50 text-cyan-600')}`}>
          {plan.image ? <Image src={plan.image} alt={plan.name} fill className="object-cover" /> : plan.category === 'GYM' ? <Layers size={24}/> : <Package size={24}/>}
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{plan.name}</h3>
          <span className="text-xs font-medium text-slate-500">{plan.durationDays} ngày • {plan.category}</span>
        </div>
      </div>

      <div className="my-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[90px] flex items-center justify-between">
         {renderPrice()}
         
         {/* Admin Actions: Promo Control */}
         {userRole === 'ADMIN' && plan.isActive && (
           plan.currentPromo && isAfter(new Date(plan.currentPromo.endDate), new Date()) ? (
             <button onClick={() => onStopPromo(plan.currentPromo!.id)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200" title="Dừng khuyến mãi"><PowerOff size={18}/></button>
           ) : (
             <button onClick={() => onPromo(plan)} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200" title="Tạo khuyến mãi"><Tag size={18}/></button>
           )
         )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
         <div className="text-xs text-slate-400 flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${plan._count.subscriptions > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div> {plan._count.subscriptions} khách
         </div>
         <div className="flex gap-2">
            {plan.category === 'CLASS' && (
                <button onClick={() => onClassManager(plan)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Xem Lịch Lớp"><CalIcon size={18}/></button>
            )}
            {userRole === 'ADMIN' && (
              <>
                  <button onClick={() => onEdit(plan)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit size={18}/></button>
                  <button onClick={() => onDelete(plan.id, plan._count.subscriptions)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </>
            )}
         </div>
      </div>
    </div>
  );
}