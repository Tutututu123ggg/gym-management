"use client";
import React from 'react';
import { format } from 'date-fns';
import { CheckInHistory } from '@/types/customer/progress';

export default function HistoryCard({ history }: { history: CheckInHistory[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[250px]">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 shrink-0">🕒 Lịch sử (7 ngày)</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {history.length === 0 ? <p className="text-center opacity-50 mt-8 text-xs">Tuần này chưa đi tập</p> : 
                history.map((h) => (
                    <div key={h.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 text-xs">
                        <div>
                            <span className="font-medium block">{format(new Date(h.checkInAt), 'dd/MM')}</span>
                            {h.checkOutAt && (
                                <span className="text-[10px] text-gray-400">{((new Date(h.checkOutAt).getTime() - new Date(h.checkInAt).getTime()) / (1000 * 60)).toFixed(0)} phút</span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-green-600">IN: {format(new Date(h.checkInAt), 'HH:mm')}</div>
                            {h.checkOutAt ? <div className="text-rose-600">OUT: {format(new Date(h.checkOutAt), 'HH:mm')}</div> : <div className="text-green-600 animate-pulse font-bold">...</div>}
                        </div>
                    </div>
                ))
            }
        </div>
    </div>
  );
}