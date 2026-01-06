"use client";
import React, { useState } from 'react';
import { CreateScheduleInput } from '@/types/admin/plan';

interface Props {
  trainers: { id: string; name: string | null }[];
  rooms: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (data: CreateScheduleInput) => void;
}

export default function ScheduleFormModal({ trainers, rooms, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<any>({
    trainerId: '', roomId: '', startTime: '18:00', durationMinutes: 60,
    maxCapacity: 20, startDate: '', endDate: '', repeatDays: []
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.repeatDays.length === 0) return alert("Chọn ít nhất 1 ngày lặp lại!");
    setSaving(true);
    await onSubmit({
        ...form,
        durationMinutes: Number(form.durationMinutes),
        maxCapacity: Number(form.maxCapacity),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate)
    });
    setSaving(false);
  };

  const toggleDay = (day: number) => {
    setForm((p: any) => ({
        ...p,
        repeatDays: p.repeatDays.includes(day) 
            ? p.repeatDays.filter((d: number) => d !== day) 
            : [...p.repeatDays, day]
    }));
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-slate-900 p-6 rounded-xl shadow-2xl border border-slate-200 w-96 z-10 animate-in zoom-in-95">
       <h4 className="font-bold mb-4 text-lg">Thêm lịch học</h4>
       <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="text-xs font-bold text-slate-500">Huấn luyện viên</label><select className="input-std w-full" onChange={e => setForm({...form, trainerId: e.target.value})} required><option value="">-- Chọn HLV --</option>{trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label className="text-xs font-bold text-slate-500">Phòng tập</label><select className="input-std w-full" onChange={e => setForm({...form, roomId: e.target.value})} required><option value="">-- Chọn Phòng --</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-2">
             <div><label className="text-xs text-slate-500">Bắt đầu</label><input type="time" className="input-std w-full" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required/></div>
             <div><label className="text-xs text-slate-500">Phút</label><input type="number" className="input-std w-full" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: e.target.value})}/></div>
          </div>
          <div>
             <label className="text-xs text-slate-500 mb-1 block">Lặp lại thứ:</label>
             <div className="flex gap-1 justify-between">
                {['CN','T2','T3','T4','T5','T6','T7'].map((d, i) => (
                   <button key={i} type="button" onClick={() => toggleDay(i)} className={`w-8 h-8 rounded text-xs font-bold transition-colors ${form.repeatDays.includes(i) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{d}</button>
                ))}
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div><label className="text-xs text-slate-500">Từ</label><input type="date" className="input-std w-full" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required/></div>
             <div><label className="text-xs text-slate-500">Đến</label><input type="date" className="input-std w-full" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required/></div>
          </div>
          <div className="flex gap-2 pt-2"><button type="button" onClick={onClose} className="flex-1 py-2 border rounded text-sm hover:bg-slate-50">Hủy</button><button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded text-sm shadow-lg">{saving ? '...' : 'Lưu'}</button></div>
       </form>
    </div>
  );
}