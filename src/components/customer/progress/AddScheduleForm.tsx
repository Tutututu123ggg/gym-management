"use client";
import React, { useState } from 'react';
import { Repeat } from 'lucide-react';

interface Props {
  onAdd: (data: any) => void;
}

export default function AddScheduleForm({ onAdd }: Props) {
  const [form, setForm] = useState({ 
      title: '', 
      date: '', 
      type: 'SELF_PRACTICE', 
      trainerName: '',
      recurrence: 'NONE', // NONE, DAILY, WEEKLY
      untilDate: ''
  });

  const [isExpanded, setIsExpanded] = useState(false); // Để ẩn hiện phần nâng cao

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) return alert("Vui lòng chọn ngày giờ bắt đầu!");
    if (form.recurrence !== 'NONE' && !form.untilDate) return alert("Vui lòng chọn ngày kết thúc lặp lại!");

    onAdd(form);
    // Reset form
    setForm({ title: '', date: '', type: 'SELF_PRACTICE', trainerName: '', recurrence: 'NONE', untilDate: '' });
    setIsExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-blue-600 flex justify-between items-center">
            Lên kế hoạch mới
            {/* Toggle hiển thị nâng cao */}
            <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-blue-500 transition-colors">
                <Repeat size={16} />
            </button>
        </h3>
        <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2">
                <select 
                    className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-blue-500 transition-colors" 
                    value={form.type} 
                    onChange={(e) => setForm({...form, type: e.target.value})}
                >
                    <option value="SELF_PRACTICE">📅 Tự tập</option>
                    <option value="WITH_TRAINER">🎓 Lớp / HLV</option>
                </select>
                <input 
                    type="datetime-local" 
                    required 
                    className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-blue-500 transition-colors" 
                    value={form.date} 
                    onChange={(e) => setForm({...form, date: e.target.value})} 
                />
            </div>

            <input 
                type="text" 
                placeholder="Nội dung (VD: Tập ngực, Yoga...)" 
                required 
                className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-blue-500 transition-colors" 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})} 
            />

            {form.type === 'WITH_TRAINER' && (
                <input 
                    type="text" 
                    placeholder="Tên HLV (Tuỳ chọn)" 
                    className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-blue-500 transition-colors" 
                    value={form.trainerName} 
                    onChange={(e) => setForm({...form, trainerName: e.target.value})} 
                />
            )}

            {/* Phần Lặp lại (Hiện khi bấm icon hoặc chọn lặp) */}
            {(isExpanded || form.recurrence !== 'NONE') && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Lặp lại:</label>
                        <select 
                            className="flex-1 p-1.5 text-xs border rounded bg-white dark:bg-slate-900 dark:border-slate-600 outline-none"
                            value={form.recurrence}
                            onChange={(e) => setForm({...form, recurrence: e.target.value})}
                        >
                            <option value="NONE">Không lặp</option>
                            <option value="DAILY">Hàng ngày</option>
                            <option value="WEEKLY">Hàng tuần</option>
                            <option value="MONTHLY">Hàng tháng</option>
                        </select>
                    </div>
                    
                    {form.recurrence !== 'NONE' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Đến ngày:</label>
                            <input 
                                type="date"
                                required
                                className="flex-1 p-1.5 text-xs border rounded bg-white dark:bg-slate-900 dark:border-slate-600 outline-none"
                                value={form.untilDate}
                                onChange={(e) => setForm({...form, untilDate: e.target.value})}
                            />
                        </div>
                    )}
                </div>
            )}

            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow transition-colors cursor-pointer">
                + Thêm lịch
            </button>
        </form>
    </div>
  );
}