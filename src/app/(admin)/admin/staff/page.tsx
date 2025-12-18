"use client";

import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Save, Star, 
  CalendarCheck, User as UserIcon, Award, Calculator, DollarSign 
} from 'lucide-react';
import { getStaffKPIs, upsertKPI, type StaffKPIResult, type KPIActionResult } from '@/actions/admin-staff';

// --- TYPES DEFINITION ---

// Định nghĩa kiểu dữ liệu cho State Edits (Dữ liệu đang nhập trên UI)
interface EditState {
    kpi: number;
    sessions: number;
    bonus: number; // 👈 Đã thêm trường Bonus
    notes: string;
}

export default function StaffPage() {
  // --- STATE ---
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [staffList, setStaffList] = useState<StaffKPIResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Lưu tạm giá trị đang nhập: Record<userId, EditState>
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  
  // Trạng thái loading của nút Save từng dòng
  const [savingId, setSavingId] = useState<string | null>(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
        const res: KPIActionResult = await getStaffKPIs(currentMonth);
        if (res.success && res.data) {
            setStaffList(res.data);
            setEdits({}); // Reset form nhập liệu khi đổi tháng
        }
    } catch (error) {
        console.error("Failed to load staff data", error);
    } finally {
        setLoading(false);
    }
  };

  // Load lại dữ liệu khi tháng thay đổi
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  // --- HELPERS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // --- HANDLERS ---
  
  // Xử lý khi nhập liệu
  const handleInputChange = (
      userId: string, 
      field: keyof EditState, 
      value: string | number
  ) => {
    setEdits(prev => {
      // Tìm data gốc để làm fallback nếu chưa edit
      const originalStaff = staffList.find(s => s.id === userId);
      
      const currentVal: EditState = prev[userId] || {
        kpi: originalStaff?.kpiData?.kpiScore || 0,
        sessions: originalStaff?.kpiData?.sessions || 0,
        bonus: originalStaff?.kpiData?.bonus || 0, // 👈 Lấy bonus gốc
        notes: originalStaff?.kpiData?.notes || ''
      };

      return {
        ...prev,
        [userId]: { ...currentVal, [field]: value }
      };
    });
  };

  // Nút Auto-fill: Lấy số liệu gợi ý điền vào ô nhập
  const handleUseSuggestion = (staff: StaffKPIResult) => {
    handleInputChange(staff.id, 'sessions', staff.suggestedSessions);
  };

  // Lưu KPI lên Server
  const handleSave = async (staff: StaffKPIResult) => {
    // Ưu tiên lấy data từ state edits, nếu không có thì lấy data cũ
    const dataToSave = edits[staff.id] || {
        kpi: staff.kpiData?.kpiScore || 0,
        sessions: staff.kpiData?.sessions || 0,
        bonus: staff.kpiData?.bonus || 0, // 👈 Lấy bonus cũ nếu không sửa
        notes: staff.kpiData?.notes || ''
    };

    setSavingId(staff.id); // Bật loading cho nút Save
    
    const res = await upsertKPI({
        userId: staff.id,
        month: currentMonth,
        kpiScore: Number(dataToSave.kpi),
        sessions: Number(dataToSave.sessions),
        bonus: Number(dataToSave.bonus), // 👈 Gửi bonus lên server
        notes: dataToSave.notes
    });
    
    setSavingId(null); // Tắt loading

    if (res.success) {
        fetchData(); 
    } else {
        alert(res.message);
    }
  };

  return (
    <div className="w-full h-full min-h-screen space-y-6 pb-20 p-6 bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER & MONTH PICKER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="text-yellow-500"/> Quản Lý KPI & Nhân Sự
           </h1>
           <p className="text-sm text-slate-500">Đánh giá hiệu suất và tính thưởng hàng tháng.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
           <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
           >
              <ChevronLeft size={20}/>
           </button>
           
           <div className="flex items-center gap-2 px-2">
              <CalendarCheck size={20} className="text-blue-600"/>
              <span className="font-bold text-lg text-slate-800 dark:text-white capitalize">
                 {format(currentMonth, 'MMMM yyyy')}
              </span>
           </div>
           
           <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
           >
              <ChevronRight size={20}/>
           </button>
        </div>
      </div>

      {/* STAFF TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                     <th className="p-4 w-[250px]">Nhân viên</th>
                     <th className="p-4 w-[100px]">Vai trò</th>
                     <th className="p-4 w-[160px]">Số buổi / Ca</th>
                     <th className="p-4 w-[180px]">Thưởng (VND)</th> {/* 👈 Cột Mới */}
                     <th className="p-4 w-[120px]">Điểm KPI</th>
                     <th className="p-4">Ghi chú</th>
                     <th className="p-4 w-[80px]">Lưu</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                     <tr><td colSpan={7} className="p-10 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                  ) : staffList.length === 0 ? (
                     <tr><td colSpan={7} className="p-10 text-center text-slate-400">Không tìm thấy nhân viên (Staff/Trainer).</td></tr>
                  ) : staffList.map(staff => {
                     // Lấy giá trị để hiển thị (Ưu tiên State Edits -> Data Server -> Default 0)
                     const kpiVal = edits[staff.id]?.kpi ?? staff.kpiData?.kpiScore ?? 0;
                     const sessVal = edits[staff.id]?.sessions ?? staff.kpiData?.sessions ?? 0;
                     const bonusVal = edits[staff.id]?.bonus ?? staff.kpiData?.bonus ?? 0; // 👈 Lấy bonus
                     const noteVal = edits[staff.id]?.notes ?? staff.kpiData?.notes ?? "";
                     
                     // Kiểm tra xem dòng này có đang được chỉnh sửa không
                     const isChanged = edits[staff.id] !== undefined;

                     return (
                        <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                           
                           {/* 1. INFO */}
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    {staff.name?.[0]?.toUpperCase() || <UserIcon size={18}/>}
                                 </div>
                                 <div>
                                    <div className="font-bold text-slate-800 dark:text-white text-sm">{staff.name || "Unknown"}</div>
                                    <div className="text-xs text-slate-500">{staff.department || staff.email}</div>
                                 </div>
                              </div>
                           </td>

                           {/* 2. ROLE */}
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${staff.role === 'TRAINER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {staff.role}
                              </span>
                           </td>

                           {/* 3. SESSIONS */}
                           <td className="p-4">
                              <div className="flex items-center gap-2">
                                 <input 
                                    type="number" 
                                    className="w-16 p-2 text-center border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-black text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                    value={sessVal}
                                    onChange={(e) => handleInputChange(staff.id, 'sessions', e.target.value)}
                                 />
                                 {/* Nút gợi ý (Chỉ hiện cho Trainer nếu số gợi ý khác số hiện tại) */}
                                 {staff.role === 'TRAINER' && staff.suggestedSessions !== Number(sessVal) && (
                                    <button 
                                       onClick={() => handleUseSuggestion(staff)}
                                       className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 tooltip-trigger transition-colors"
                                       title={`Hệ thống đếm được ${staff.suggestedSessions} lớp.`}
                                    >
                                       <Calculator size={14}/>
                                       <span className="text-[10px] ml-1 font-bold">{staff.suggestedSessions}</span>
                                    </button>
                                 )}
                              </div>
                           </td>

                           {/* 4. BONUS (NEW COLUMN) */}
                           <td className="p-4">
                              <div className="relative">
                                 <DollarSign size={14} className="absolute left-2 top-3 text-slate-400"/>
                                 <input 
                                    type="number" 
                                    className="w-32 pl-7 p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-black text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="0"
                                    value={bonusVal} 
                                    onChange={(e) => handleInputChange(staff.id, 'bonus', e.target.value)}
                                 />
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 pl-1 font-mono">
                                 {formatCurrency(Number(bonusVal))}
                              </div>
                           </td>

                           {/* 5. KPI SCORE */}
                           <td className="p-4">
                              <div className="flex items-center gap-1">
                                 <input 
                                    type="number" 
                                    className={`w-16 p-2 text-center border rounded bg-white dark:bg-black text-sm font-bold focus:ring-2 outline-none
                                       ${kpiVal >= 90 ? 'text-green-600 border-green-200' : 
                                         kpiVal >= 70 ? 'text-blue-600 border-blue-200' : 
                                         'text-red-600 border-red-200'}
                                    `}
                                    value={kpiVal}
                                    onChange={(e) => handleInputChange(staff.id, 'kpi', e.target.value)}
                                    max={100}
                                    min={0}
                                 />
                                 <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                              </div>
                           </td>

                           {/* 6. NOTES */}
                           <td className="p-4">
                              <input 
                                 type="text" 
                                 className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-black text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                 placeholder="Nhập đánh giá..."
                                 value={noteVal}
                                 onChange={(e) => handleInputChange(staff.id, 'notes', e.target.value)}
                              />
                           </td>

                           {/* 7. ACTION SAVE */}
                           <td className="p-4 text-center">
                              <button 
                                 onClick={() => handleSave(staff)}
                                 // Disable nếu đang lưu OR (chưa sửa gì VÀ đã có dữ liệu cũ rồi)
                                 disabled={savingId === staff.id || (!isChanged && staff.kpiData !== null)}
                                 className={`p-2 rounded-lg transition-all shadow-sm flex items-center justify-center
                                    ${isChanged 
                                       ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                                       : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                    }
                                 `}
                                 title="Lưu đánh giá"
                              >
                                 {savingId === staff.id ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                 ) : (
                                    <Save size={18}/>
                                 )}
                              </button>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}