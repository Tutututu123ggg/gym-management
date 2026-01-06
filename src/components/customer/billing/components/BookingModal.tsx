"use client";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getPlanSessions } from '@/actions/customer/booking';
import { Icons } from './Shared';

interface Props {
  planId: string;
  planName: string;
  onClose: () => void;
  onBook: (sessionId: string) => Promise<{ success: boolean; message: string }>;
}

export default function BookingModal({ planId, planName, onClose, onBook }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Gọi server action lấy lịch
    getPlanSessions(planId).then(data => {
      setSessions(data);
      setLoading(false);
    });
  }, [planId]);

  const handleBook = async (sessionId: string) => {
    setProcessingId(sessionId);
    const res = await onBook(sessionId);
    
    if (res.success) {
        alert("Thành công: " + res.message);
        onClose();
    } else {
        alert("Lỗi: " + res.message);
    }
    setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-card w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-800">
            <div>
                <h3 className="text-xl font-bold">Đăng ký lịch học</h3>
                <p className="text-sm text-gray-500">Gói: <span className="font-semibold text-blue-600">{planName}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"><Icons.XCircle /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang tải lịch học...
                </div>
            ) : (
                sessions.length === 0 ? <div className="text-center py-10 text-gray-500 italic">Hiện chưa có lịch học nào sắp tới cho gói này.</div> :
                sessions.map((s) => (
                    <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all bg-gray-50 dark:bg-gray-900/30 group">
                        <div className="mb-3 sm:mb-0">
                            <div className="font-bold text-lg text-blue-700 dark:text-blue-400 group-hover:text-blue-600 transition-colors">{s.gymClass.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                                <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-xs font-semibold">
                                    {format(new Date(s.startTime), 'dd/MM/yyyy')}
                                </span>
                                <span className="font-medium">
                                    {format(new Date(s.startTime), 'HH:mm')} - {format(new Date(s.endTime), 'HH:mm')}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                <span className="flex items-center gap-1">👤 HLV: <span className="text-foreground">{s.trainer?.name || 'TBD'}</span></span>
                                <span className="flex items-center gap-1">📍 Phòng: <span className="text-foreground">{s.room?.name || 'TBD'}</span></span>
                                <span className={s.isFull ? "text-red-500 font-bold" : "text-green-600 font-medium"}>
                                    ⚡ {s.currentBookings}/{s.maxCapacity} chỗ
                                </span>
                            </div>
                        </div>
                        <button 
                            disabled={s.isFull || processingId === s.id}
                            onClick={() => handleBook(s.id)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg shadow transition-all shrink-0 active:scale-95 ${
                                s.isFull 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/30'
                            }`}
                        >
                            {processingId === s.id ? "Đang xử lý..." : (s.isFull ? "Đã đầy" : "Đăng ký ngay")}
                        </button>
                    </div>
                ))
            )}
        </div>
        
        <div className="pt-4 border-t dark:border-gray-800 mt-2 text-right">
             <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 hover:underline px-2">Đóng cửa sổ</button>
        </div>
      </div>
    </div>
  );
}