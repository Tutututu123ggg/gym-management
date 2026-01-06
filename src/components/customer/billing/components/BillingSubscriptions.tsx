"use client";
import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Subscription } from '@/types/customer/billing';
import { Icons, PaginationControls, GhostRows } from './Shared';

interface Props {
  subscriptions: Subscription[];
  onRenew: (subId: string) => void;
  onCancel: (subId: string) => void;
  onToggleAutoRenew: (subId: string, currentStatus: boolean) => void;
  onBookClass: (sub: Subscription) => void; // Prop mới
}

export default function BillingSubscriptions({ subscriptions, onRenew, onCancel, onToggleAutoRenew, onBookClass }: Props) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 3;
  // Bỏ fix cứng height để card tự co giãn theo nội dung
  const MIN_HEIGHT = "min-h-[100px]"; 

  const totalPages = Math.ceil(subscriptions.length / ITEMS_PER_PAGE);
  const visibleItems = subscriptions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col">
        <h2 className="font-bold text-lg mb-4">Gói dịch vụ của tôi</h2>
        <div className="space-y-4 mb-4">
            {subscriptions.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">Bạn chưa đăng ký gói nào.</p>
            ) : (
                <>
                    {visibleItems.map((sub) => {
                        const daysLeft = differenceInDays(new Date(sub.endDate), new Date());
                        const canRenewEarly = sub.isActive && daysLeft <= 7; 
                        
                        return (
                            <div key={sub.id} className={`w-full ${MIN_HEIGHT} border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-blue-300 transition-colors`}>
                                
                                {/* CỘT TRÁI: Thông tin gói */}
                                <div className="flex-1 min-w-0"> 
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-bold text-base md:text-lg leading-snug break-words">{sub.plan.name}</h3>
                                        {sub.isActive ? 
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-green-200 dark:border-green-800">Active</span> :
                                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-gray-200 dark:border-gray-700">Đã hết hạn</span>
                                        }
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1">
                                        <span>Hết hạn: <span className="font-medium text-foreground">{format(new Date(sub.endDate), 'dd/MM/yyyy')}</span></span>
                                        {sub.isActive && <span className={`text-xs ${daysLeft <= 7 ? 'text-rose-500 font-bold' : 'text-gray-400'}`}>(Còn {Math.max(0, daysLeft)} ngày)</span>}
                                    </div>
                                </div>

                                {/* CỘT PHẢI: Các nút hành động */}
                                <div className="flex flex-col items-end gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-100 dark:border-gray-800 md:border-0">
                                    {sub.isActive ? (
                                        <>
                                            {/* GROUP NÚT: Đặt cạnh nhau */}
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                {/* Nút Đăng ký lớp */}
                                                <button 
                                                    onClick={() => onBookClass(sub)} 
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
                                                >
                                                   <span>📅 Đăng ký lớp</span>
                                                </button>

                                                {/* Nút Hủy hoặc Gia hạn */}
                                                {canRenewEarly ? (
                                                    <button onClick={() => onRenew(sub.id)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap">
                                                        <Icons.Refresh /> Gia hạn
                                                    </button>
                                                ) : (
                                                    <button onClick={() => onCancel(sub.id)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-red-500 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap">
                                                        <Icons.XCircle /> Hủy
                                                    </button>
                                                )}
                                            </div>

                                            {/* Toggle Tự động gia hạn */}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">Tự động gia hạn:</span>
                                                <button onClick={() => onToggleAutoRenew(sub.id, sub.autoRenew)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sub.autoRenew ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${sub.autoRenew ? 'translate-x-5' : 'translate-x-1'}`}/>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        /* Trạng thái hết hạn */
                                        <button onClick={() => onRenew(sub.id)} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95">
                                            <Icons.Refresh /> Đăng ký lại
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    <GhostRows count={ITEMS_PER_PAGE - visibleItems.length} height="h-[100px]" />
                </>
            )}
        </div>
        <PaginationControls current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}