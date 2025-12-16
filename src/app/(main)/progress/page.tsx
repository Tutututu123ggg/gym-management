"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart 
} from 'recharts';
import { toggleCheckIn, getDashboardData, addSchedule, addBodyMetric, toggleScheduleStatus } from '@/actions/progress';
import WeeklyCalendar from '@/components/WeeklyCalendar'; 

// --- 1. DEFINITIONS ---
interface UserStats {
  currentStreak: number;
  totalCheckIns: number;
  totalHours: number;
}

interface Plan {
  id: string;
  name: string;
}

interface Subscription {
  id: string;
  endDate: Date | string;
  plan?: Plan;
}

interface Schedule {
  id: string;
  title: string;
  date: Date;
  type: 'WITH_TRAINER' | 'SELF_PRACTICE';
  isCompleted: boolean;
  trainerName?: string | null;
}

// Interface phụ: Định nghĩa đúng dạng dữ liệu Raw từ Server (Date bị string hóa)
// Dùng Omit để lấy hết các trường của Schedule trừ 'date', sau đó định nghĩa lại date
type RawSchedule = Omit<Schedule, 'date'> & { date: string | Date };

interface BodyMetric {
  id: string;
  weight: number;
  bmi: number;
  recordedAt: Date | string;
}

interface CheckInHistory {
  id: string;
  checkInAt: Date | string;
  checkOutAt?: Date | string | null;
}

interface DashboardData {
  stats: UserStats;
  plan: Plan | null;
  subscription: Subscription | null;
  schedules: Schedule[];
  metrics: BodyMetric[];
  history: CheckInHistory[];
  isWorkingOut: boolean;
}

const Icons = {
  Card: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  Time: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  // Modal State
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [metricForm, setMetricForm] = useState({ height: '', weight: '' });

  // Data States
  const [data, setData] = useState<DashboardData>({
    stats: { currentStreak: 0, totalCheckIns: 0, totalHours: 0 },
    plan: null,
    subscription: null,
    schedules: [],
    metrics: [],
    history: [],
    isWorkingOut: false
  });

  const [scheduleForm, setScheduleForm] = useState({ title: '', date: '', type: 'SELF_PRACTICE', trainerName: '' });

  // --- 2. FETCH DATA (FIX LINE 106) ---
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const res = await getDashboardData(user.id);
        
        if (isMounted) {
           // Ép kiểu 'res.schedules' về mảng RawSchedule để TS hiểu date có thể là string
           const rawSchedules = res.schedules as unknown as RawSchedule[];

           // Map qua và convert date chuẩn
           const formattedSchedules: Schedule[] = rawSchedules.map((s) => ({
             ...s,
             date: new Date(s.date) // Hợp lệ vì s.date là string | Date
           }));

           setData({
             ...res,
             schedules: formattedSchedules,
             stats: res.stats || { currentStreak: 0, totalCheckIns: 0, totalHours: 0 },
             plan: res.plan || null,
             subscription: res.subscription || null,
             metrics: res.metrics || [],
             history: res.history || [],
             isWorkingOut: res.isWorkingOut
           } as DashboardData);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [user?.id, refreshTrigger]);

  const reloadData = () => setRefreshTrigger(prev => prev + 1);

  // --- HANDLERS ---
  const handleToggleCheckIn = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await toggleCheckIn(user.id);
    alert(res.message);
    reloadData(); 
    setLoading(false);
  };

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user?.id || !metricForm.height || !metricForm.weight) return;

    await addBodyMetric(user.id, parseFloat(metricForm.height), parseFloat(metricForm.weight));
    setMetricForm({ height: '', weight: '' }); 
    setIsMetricModalOpen(false); 
    reloadData(); 
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.id || !scheduleForm.date) return alert("Vui lòng chọn ngày giờ!");
      
      // Fix thêm dòng 161 (as any) bằng cách ép kiểu string về Union Type
      await addSchedule(
        user.id, 
        scheduleForm.title, 
        new Date(scheduleForm.date), 
        scheduleForm.type as 'WITH_TRAINER' | 'SELF_PRACTICE', 
        scheduleForm.trainerName
      );
      setScheduleForm({ title: '', date: '', type: 'SELF_PRACTICE', trainerName: '' });
      reloadData(); 
  };

  const handleToggleSchedule = async (id: string, status: boolean) => {
      await toggleScheduleStatus(id, status);
      reloadData();
  }

  // --- RENDER UI ---
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-background min-h-screen text-foreground relative">
      
      {/* MODAL */}
      {isMetricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cập nhật chỉ số</h3>
                <button onClick={() => setIsMetricModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                   <Icons.Close />
                </button>
             </div>
             <form onSubmit={handleSaveMetric} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chiều cao (cm)</label>
                   <input type="number" placeholder="VD: 170" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={metricForm.height} onChange={(e) => setMetricForm({...metricForm, height: e.target.value})} required />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cân nặng (kg)</label>
                   <input type="number" step="0.1" placeholder="VD: 65.5" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={metricForm.weight} onChange={(e) => setMetricForm({...metricForm, weight: e.target.value})} required />
                </div>
                {metricForm.height && metricForm.weight && (
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                      <span className="text-xs text-blue-600 dark:text-blue-400">BMI Dự tính</span>
                      <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                         {(parseFloat(metricForm.weight) / Math.pow(parseFloat(metricForm.height)/100, 2)).toFixed(2)}
                      </div>
                   </div>
                )}
                <div className="flex gap-3 mt-6">
                   <button type="button" onClick={() => setIsMetricModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Huỷ bỏ</button>
                   <button type="submit" className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95">Lưu chỉ số</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* User Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
           </div>
           <div>
              <h1 className="text-2xl font-bold">Xin chào, {user?.name || 'Gymer'} !</h1>
              <div className="mt-4 flex items-center gap-3 bg-white/20 p-3 rounded-lg backdrop-blur-sm w-fit">
                 <Icons.Card />
                 <div>
                    <p className="text-xs opacity-80">Gói tập hiện tại</p>
                    <p className="font-semibold text-sm">{data.plan ? data.plan.name : 'Chưa đăng ký gói'}</p>
                 </div>
              </div>
              {data.subscription && (
                 <p className="mt-2 text-xs opacity-70">Hết hạn: {format(new Date(data.subscription.endDate), 'dd/MM/yyyy')}</p>
              )}
           </div>
        </div>

        {/* Action Card */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
           <p className="text-sm text-gray-500 mb-2">Trạng thái hiện tại</p>
           {data.isWorkingOut ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse mb-4">🟢 Đang tập luyện</span>
           ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-4">⚪ Đang ở ngoài</span>
           )}
           <button onClick={handleToggleCheckIn} disabled={loading}
             className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all transform active:scale-95 ${data.isWorkingOut ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-100' : 'bg-emerald-500 hover:bg-emerald-600 ring-4 ring-emerald-100'}`}>
             {loading ? 'Đang xử lý...' : data.isWorkingOut ? 'CHECK-OUT (VỀ)' : 'CHECK-IN (VÀO)'}
           </button>
           <div className="mt-4 flex gap-4 text-xs text-gray-500 w-full justify-center">
              <div className="text-center">
                 <span className="block font-bold text-lg text-gray-900 dark:text-gray-100">{data.stats?.totalHours ? data.stats.totalHours.toFixed(1) : '0'}h</span> Tổng giờ tập
              </div>
              <div className="w-[1px] bg-gray-200 h-8 self-center"></div>
              <div className="text-center">
                 <span className="block font-bold text-lg text-orange-500">{data.stats?.currentStreak || 0}</span> Streak (ngày)
              </div>
           </div>
        </div>

        {/* History Card */}
        <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[250px]">
           <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 shrink-0"><Icons.Time /> Lịch sử (7 ngày)</h3>
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {data.history.length === 0 ? <p className="text-center opacity-50 mt-8 text-xs">Tuần này chưa đi tập</p> : 
                 data.history.map((h) => (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold">📅 Lịch trình tập luyện</h2>
               <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></span> Lớp/HLV</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-50 border border-blue-300"></span> Tự tập</span>
               </div>
            </div>
            <WeeklyCalendar schedules={data.schedules} onToggleStatus={handleToggleSchedule} />
         </div>

         <div className="space-y-6">
            <div className="bg-white dark:bg-card p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
               <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-blue-600">Lên kế hoạch mới</h3>
               <form className="space-y-3" onSubmit={handleAddSchedule}>
                  <div className="grid grid-cols-2 gap-2">
                     <select className="p-2 text-sm rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" value={scheduleForm.type} onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}>
                        <option value="SELF_PRACTICE">📅 Tự tập</option>
                        <option value="WITH_TRAINER">🎓 Lớp / HLV</option>
                     </select>
                     <input type="datetime-local" required className="p-2 text-sm rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" value={scheduleForm.date} onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Tên bài tập / Lớp học" required className="w-full p-2 text-sm rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" value={scheduleForm.title} onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})} />
                  {scheduleForm.type === 'WITH_TRAINER' && (
                     <input type="text" placeholder="Tên HLV (Tuỳ chọn)" className="w-full p-2 text-sm rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" value={scheduleForm.trainerName} onChange={(e) => setScheduleForm({...scheduleForm, trainerName: e.target.value})} />
                  )}
                  <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded hover:opacity-90 transition-opacity">+ Thêm vào lịch</button>
               </form>
            </div>

            <div className="bg-white dark:bg-card p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm">Chỉ số cơ thể</h3>
                  <button onClick={() => { setMetricForm({ height: '', weight: '' }); setIsMetricModalOpen(true); }} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">+ Cập nhật</button>
               </div>
               <div className="h-[200px] w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={data.metrics}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="recordedAt" tickFormatter={(t) => format(new Date(t), 'dd/MM')} />
                        <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
                        <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} hide />
                        <Tooltip labelFormatter={(l) => format(new Date(l), 'dd/MM')} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }} />
                        <Area yAxisId="left" type="monotone" dataKey="weight" name="Cân nặng" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
                        <Line yAxisId="right" type="monotone" dataKey="bmi" name="BMI" stroke="#ff7300" dot={false} strokeWidth={2} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
               {data.metrics.length > 0 && (
                  <div className="flex justify-between mt-2 text-sm border-t pt-2">
                     <div><span className="text-gray-500 text-xs">Cân nặng</span><div className="font-bold">{data.metrics[data.metrics.length-1].weight} kg</div></div>
                     <div className="text-right"><span className="text-gray-500 text-xs">BMI</span><div className="font-bold text-orange-500">{data.metrics[data.metrics.length-1].bmi}</div></div>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}