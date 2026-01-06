"use client";

import { useTrainerCheckIn } from '@/hooks/admin/useTrainer'; // Đã sửa import hook
import { useAuth } from '@/context/AuthContext';
import { Loader2, Fingerprint, LogOut, Clock, CalendarDays } from 'lucide-react';

interface CheckInWidgetProps {
  isCheckedIn: boolean;
  onRefresh: () => void;
}

export const CheckInWidget = ({ isCheckedIn, onRefresh }: CheckInWidgetProps) => {
  const { user } = useAuth();
  const { loading, handleCheckIn } = useTrainerCheckIn();

  const handleToggle = async () => {
    if (!user?.id) return;
    const success = await handleCheckIn(user.id);
    if (success) onRefresh();
  };

  const today = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', day: 'numeric', month: 'long' 
  });

  return (
    // THAY ĐỔI: Dùng bg-card, border-border, text-card-foreground
    <div className="relative overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm border border-border h-full transition-colors">
      
      {/* Background Decor */}
      <div className={`absolute top-0 left-0 w-full h-2 ${isCheckedIn ? 'bg-green-500' : 'bg-orange-500'}`} />

      <div className="p-6 flex flex-col justify-between h-full space-y-6">
        
        {/* Header Info */}
        <div className="flex justify-between items-start">
          <div>
            {/* Dùng text-muted-foreground */}
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <CalendarDays size={14} /> {today}
            </p>
            <h3 className="text-xl font-bold mt-1">
              {isCheckedIn ? "Đang trong ca làm" : "Chưa vào ca"}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isCheckedIn 
              ? 'bg-green-500/10 text-green-600 border-green-500/20' // Dùng opacity thay vì màu cứng
              : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
          }`}>
            {isCheckedIn ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        {/* Status Circle */}
        <div className="flex justify-center py-2">
          {/* Dùng bg-muted hoặc opacity */}
          <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 transition-all duration-500 ${
            isCheckedIn 
              ? 'border-green-500 bg-green-500/5' 
              : 'border-orange-500/30 bg-orange-500/5'
          }`}>
            {isCheckedIn ? (
              <Clock size={40} className="text-green-500 animate-pulse" />
            ) : (
              <Fingerprint size={40} className="text-orange-500" />
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`group w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-95 ${
            isCheckedIn
              // Trạng thái Logged In: Dùng bg-card (màu nền thẻ) và border-destructive
              ? 'bg-card border-2 border-destructive text-destructive hover:bg-destructive/10'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : isCheckedIn ? (
            <>
              <LogOut size={18} /> Kết thúc ca làm việc
            </>
          ) : (
            <>
              <Fingerprint size={18} /> Bắt đầu điểm danh
            </>
          )}
        </button>
      </div>
    </div>
  );
};