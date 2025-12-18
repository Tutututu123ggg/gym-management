"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image'; // Import Image
import { format, isAfter, startOfWeek, getDay, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// --- IMPORTS ACTIONS ---
import { 
  getPlans, upsertPlan, deletePlan, applyPromotion, stopPromotion,
  type PlanWithPromo 
} from '@/actions/admin-plan';
import { 
  getGymClassesByPlan, createGymClass, deleteGymClass, type GymClassWithStats 
} from '@/actions/admin-class';
import { 
  getClassSessions, createClassSchedule, getScheduleResources 
} from '@/actions/admin-schedule';

// --- (PLACEHOLDER) IMPORT YOUR UPLOAD ACTION HERE ---
// import { uploadImage } from '@/actions/upload'; 
// Dưới đây là hàm giả lập, bạn hãy thay bằng import thật của bạn
const uploadImageAction = async (formData: FormData): Promise<string | null> => {
    // Giả lập delay upload
    await new Promise(r => setTimeout(r, 1000));
    // Trả về mock url (Trong thực tế bạn return URL ảnh từ Cloudinary/S3/UploadThing)
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000";
};

import { PlanCategory } from '@prisma/client';
import { 
  Plus, Edit, Trash2, Tag, Layers, Package, Percent, 
  PowerOff, X, Calendar as CalIcon, Upload, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';

// --- CONFIG CALENDAR ---
const locales = { 'vi': vi };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- STRICT TYPES DEFINITION ---
interface ServerEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  resource: {
    room: string | null;
    capacity: number;
    booked: number;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    room: string;
    capacity: number;
    booked: number;
  };
}

interface ScheduleResourceData {
  trainers: { id: string; name: string | null }[];
  rooms: { id: string; name: string }[];
}

interface ScheduleFormState {
  trainerId: string;
  roomId: string;
  startTime: string;
  durationMinutes: number;
  maxCapacity: number;
  startDate: string;
  endDate: string;
  repeatDays: number[];
}

export default function PlansPage() {
  // --- STATE ---
  const [plans, setPlans] = useState<PlanWithPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.WEEK); // Mặc định xem theo tuần
  const [date, setDate] = useState(new Date()); // Mặc định ngày hôm nay
  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanWithPromo | null>(null);
  
  // Class Manager & Schedule
  const [isClassManagerOpen, setIsClassManagerOpen] = useState(false);
  const [currentPlanForClass, setCurrentPlanForClass] = useState<PlanWithPromo | null>(null);
  const [gymClasses, setGymClasses] = useState<GymClassWithStats[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // Calendar Data
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [scheduleResources, setScheduleResources] = useState<ScheduleResourceData>({ trainers: [], rooms: [] });
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  // Forms & Helpers
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newClassName, setNewClassName] = useState('');

  // --- STATE CHO UPLOAD ẢNH ---
  const [planForm, setPlanForm] = useState({
    name: '', category: 'GYM' as PlanCategory, price: 0, durationDays: 30, desc: '', isActive: true,
    image: '' // Thêm field image
  });
  const [imageUploadMode, setImageUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [promoForm, setPromoForm] = useState({
    name: '', salePrice: 0, startDate: '', endDate: ''
  });

  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>({
    trainerId: '', roomId: '', startTime: '18:00', durationMinutes: 60, maxCapacity: 20,
    startDate: '', endDate: '', repeatDays: []
  });

  // --- 1. FETCH PLANS ---
  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      if (res.success && res.data) {
        setPlans(res.data as PlanWithPromo[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans, refreshKey]);

  // --- 2. FETCH SCHEDULE RESOURCES ---
  useEffect(() => {
    const fetchRes = async () => {
       const res = await getScheduleResources();
       if (res.success) {
         setScheduleResources({ 
           trainers: res.trainers || [], 
           rooms: res.rooms || [] 
         });
       }
    };
    fetchRes();
  }, []);

  // --- 3. FETCH SCHEDULE EVENTS ---
  useEffect(() => {
    if (!selectedClassId || !isClassManagerOpen) return;
    
    const fetchSchedule = async () => {
        const start = new Date(); start.setMonth(start.getMonth() - 1);
        const end = new Date(); end.setMonth(end.getMonth() + 2);
        
        const res = await getClassSessions(start, end, selectedClassId);
        
        if (res.success && res.data) {
            const serverData = res.data as ServerEvent[];
            
            const formattedEvents: CalendarEvent[] = serverData.map((evt) => ({
                id: evt.id,
                title: evt.title,
                start: new Date(evt.start),
                end: new Date(evt.end),
                resource: {
                    room: evt.resource.room || 'Chưa xếp phòng',
                    capacity: evt.resource.capacity,
                    booked: evt.resource.booked
                }
            }));
            setEvents(formattedEvents);
        }
    };
    fetchSchedule();
  }, [selectedClassId, isClassManagerOpen, refreshKey]);


  // ================= HANDLERS: PLAN =================
  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', category: 'GYM', price: 0, durationDays: 30, desc: '', isActive: true, image: '' });
    setImageUploadMode('FILE');
    setIsPlanModalOpen(true);
  };

  const openEditPlan = (plan: PlanWithPromo) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name, category: plan.category, price: plan.price, 
      durationDays: plan.durationDays, desc: plan.desc || '', isActive: plan.isActive,
      image: plan.image || '' // Load ảnh cũ nếu có
    });
    setImageUploadMode(plan.image ? 'URL' : 'FILE');
    setIsPlanModalOpen(true);
  };

  // --- LOGIC UPLOAD ẢNH ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const formData = new FormData();
        formData.append('file', file);
        // GỌI SERVER ACTION UPLOAD CỦA BẠN TẠI ĐÂY
        const url = await uploadImageAction(formData); 
        
        if (url) {
            setPlanForm(prev => ({ ...prev, image: url }));
        } else {
            alert("Upload thất bại");
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi upload ảnh");
    } finally {
        setIsUploading(false);
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await upsertPlan({
      id: editingPlan?.id,
      ...planForm,
      price: Number(planForm.price),
      durationDays: Number(planForm.durationDays)
    });
    setIsSaving(false);
    if (res.success) {
      setIsPlanModalOpen(false);
      setRefreshKey(p => p + 1);
    } else {
      alert(res.message);
    }
  };

  const handleDeletePlan = async (id: string, activeUsers: number) => {
    if (activeUsers > 0) return alert(`Không thể xóa! Có ${activeUsers} khách đang dùng.`);
    if (!confirm("Xóa gói này?")) return;
    const res = await deletePlan(id);
    if (res.success) setRefreshKey(p => p + 1);
  };


  // ================= HANDLERS: PROMOTION =================
  const openPromoModal = (plan: PlanWithPromo) => {
    setEditingPlan(plan);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    setPromoForm({
      name: `Sale ${format(now, 'MM/yyyy')}`,
      salePrice: plan.price * 0.8,
      startDate: todayStr,
      endDate: nextWeekStr
    });
    setIsPromoModalOpen(true);
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setIsSaving(true);
    const res = await applyPromotion(editingPlan.id, {
      name: promoForm.name,
      salePrice: Number(promoForm.salePrice),
      startDate: new Date(promoForm.startDate),
      endDate: new Date(promoForm.endDate)
    });
    setIsSaving(false);
    if (res.success) {
      setIsPromoModalOpen(false);
      setRefreshKey(p => p + 1);
    } else {
      alert(res.message);
    }
  };

  const handleStopPromo = async (promoId: string) => {
    if (!confirm("Dừng khuyến mãi này ngay?")) return;
    const res = await stopPromotion(promoId);
    if (res.success) setRefreshKey(p => p + 1);
  };


  // ================= HANDLERS: CLASS MANAGER & SCHEDULE =================
  const openClassManager = async (plan: PlanWithPromo) => {
    setCurrentPlanForClass(plan);
    const res = await getGymClassesByPlan(plan.id);
    if (res.success && res.data) {
        const classes = res.data as GymClassWithStats[];
        setGymClasses(classes);
        if (classes.length > 0) setSelectedClassId(classes[0].id);
        else setSelectedClassId(null);
    }
    setIsClassManagerOpen(true);
  };

  const handleAddGymClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlanForClass || !newClassName.trim()) return;
    const res = await createGymClass(currentPlanForClass.id, newClassName);
    if (res.success) {
      setNewClassName('');
      const updated = await getGymClassesByPlan(currentPlanForClass.id);
      if (updated.success && updated.data) {
         setGymClasses(updated.data as GymClassWithStats[]);
      }
    } else {
      alert(res.message);
    }
  };

  const handleDeleteGymClass = async (id: string) => {
    if(!confirm("Xóa lớp này?")) return;
    const res = await deleteGymClass(id);
    if (res.success) {
       const updated = await getGymClassesByPlan(currentPlanForClass!.id);
       if (updated.success && updated.data) {
          const classes = updated.data as GymClassWithStats[];
          setGymClasses(classes);
          if (selectedClassId === id) setSelectedClassId(classes.length > 0 ? classes[0].id : null);
       }
    } else {
       alert(res.message);
    }
  };

  const openScheduleForm = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nextMonth = new Date(now);
    nextMonth.setDate(now.getDate() + 30);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    setScheduleForm({
      trainerId: '', roomId: '', startTime: '18:00', durationMinutes: 60, maxCapacity: 20,
      startDate: todayStr, endDate: nextMonthStr, repeatDays: []
    });
    setIsScheduleFormOpen(true);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    if (scheduleForm.repeatDays.length === 0) return alert("Chọn ít nhất 1 ngày lặp lại!");
    
    setIsSaving(true);
    const res = await createClassSchedule({
        gymClassId: selectedClassId,
        ...scheduleForm,
        startDate: new Date(scheduleForm.startDate),
        endDate: new Date(scheduleForm.endDate)
    });
    setIsSaving(false);

    if (res.success) {
        setIsScheduleFormOpen(false);
        setRefreshKey(p => p + 1);
        alert(res.message);
    } else {
        alert(res.message);
    }
  };

  const handleDaySelect = (day: number) => {
    setScheduleForm(prev => {
      const exists = prev.repeatDays.includes(day);
      if (exists) return { ...prev, repeatDays: prev.repeatDays.filter(d => d !== day) };
      return { ...prev, repeatDays: [...prev.repeatDays, day] };
    });
  };

  // --- HELPER RENDER PRICE ---
  const renderPrice = (plan: PlanWithPromo) => {
    if (plan.currentPromo && isAfter(new Date(plan.currentPromo.endDate), new Date())) {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600 text-xl">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.currentPromo.salePrice)}
            </span>
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center animate-pulse"><Percent size={10} className="mr-0.5"/> SALE</span>
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
    <div className="space-y-6 min-h-screen pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gói tập & Dịch vụ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý các gói Membership và Lớp học.</p>
        </div>
        <button onClick={openCreatePlan} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
          <Plus size={18} /> Gói mới
        </button>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>)
        ) : plans.length === 0 ? (
          <p className="text-slate-500 col-span-3 text-center py-10">Chưa có gói tập nào.</p>
        ) : plans.map(plan => (
          <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm hover:shadow-md transition-all group ${!plan.isActive ? 'border-slate-200 opacity-60 grayscale' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="absolute top-4 right-4">
               {!plan.isActive && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-300">Đã ẩn</span>}
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className={`p-3 rounded-lg overflow-hidden relative shrink-0 w-16 h-16 flex items-center justify-center ${plan.image ? 'bg-transparent' : (plan.category === 'GYM' ? 'bg-blue-50 text-blue-600' : plan.category === 'CLASS' ? 'bg-purple-50 text-purple-600' : 'bg-cyan-50 text-cyan-600')}`}>
                {plan.image ? (
                   <Image src={plan.image} alt={plan.name} fill className="object-cover" />
                ) : (
                   plan.category === 'GYM' ? <Layers size={24}/> : <Package size={24}/>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{plan.name}</h3>
                <span className="text-xs font-medium text-slate-500">{plan.durationDays} ngày • {plan.category}</span>
              </div>
            </div>

            <div className="my-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[90px] flex items-center justify-between">
               {renderPrice(plan)}
               {plan.isActive && (
                 plan.currentPromo && isAfter(new Date(plan.currentPromo.endDate), new Date()) ? (
                   <button onClick={() => handleStopPromo(plan.currentPromo!.id)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200" title="Dừng khuyến mãi"><PowerOff size={18}/></button>
                 ) : (
                   <button onClick={() => openPromoModal(plan)} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200" title="Tạo khuyến mãi"><Tag size={18}/></button>
                 )
               )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="text-xs text-slate-400 flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${plan._count.subscriptions > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  {plan._count.subscriptions} khách
               </div>
               <div className="flex gap-2">
                  {plan.category === 'CLASS' && (
                     <button onClick={() => openClassManager(plan)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Quản lý Lớp & Lịch">
                        <CalIcon size={18}/>
                     </button>
                  )}
                  <button onClick={() => openEditPlan(plan)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit size={18}/></button>
                  <button onClick={() => handleDeletePlan(plan.id, plan._count.subscriptions)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18}/></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* === MODAL 1: PLAN (CREATE / EDIT) === */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingPlan ? "Cập nhật Gói" : "Tạo gói mới"}</h3>
               <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button>
            </div>
            <form onSubmit={handlePlanSubmit} className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                 {/* Cột trái: Thông tin cơ bản */}
                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tên gói *</label>
                       <input type="text" className="w-full p-2.5 border rounded-lg bg-white dark:bg-black dark:border-slate-700" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} required placeholder="VD: Gói Yoga" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Loại</label>
                       <select className="w-full p-2.5 border rounded-lg bg-white dark:bg-black dark:border-slate-700" value={planForm.category} onChange={e => setPlanForm({...planForm, category: e.target.value as PlanCategory})}>
                          <option value="GYM">GYM</option>
                          <option value="CLASS">Lớp học</option>
                          <option value="POOL">Bơi lội</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Giá (VND)</label>
                           <input type="number" className="w-full p-2.5 border rounded-lg bg-white dark:bg-black dark:border-slate-700" value={planForm.price} onChange={e => setPlanForm({...planForm, price: Number(e.target.value)})} required />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hạn (Ngày)</label>
                           <input type="number" className="w-full p-2.5 border rounded-lg bg-white dark:bg-black dark:border-slate-700" value={planForm.durationDays} onChange={e => setPlanForm({...planForm, durationDays: Number(e.target.value)})} required />
                        </div>
                    </div>
                 </div>

                 {/* Cột phải: Upload Ảnh */}
                 <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ảnh minh họa</label>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-black/50">
                        <div className="flex gap-2 mb-3">
                           <button type="button" onClick={() => setImageUploadMode('FILE')} className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center gap-1 ${imageUploadMode === 'FILE' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><Upload size={12}/> Upload</button>
                           <button type="button" onClick={() => setImageUploadMode('URL')} className={`flex-1 text-xs py-1.5 rounded flex items-center justify-center gap-1 ${imageUploadMode === 'URL' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><LinkIcon size={12}/> URL</button>
                        </div>
                        
                        {imageUploadMode === 'FILE' ? (
                           <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                              {isUploading ? <span className="text-xs text-blue-500 animate-pulse">Đang tải lên...</span> : (
                                <div className="text-center text-slate-400">
                                   <Upload size={20} className="mx-auto mb-1"/>
                                   <span className="text-xs">Click chọn ảnh</span>
                                </div>
                              )}
                           </div>
                        ) : (
                           <input type="text" placeholder="https://..." className="w-full text-xs p-2 border rounded dark:bg-black dark:border-slate-800" value={planForm.image} onChange={e => setPlanForm({...planForm, image: e.target.value})} />
                        )}

                        {planForm.image && (
                           <div className="mt-3 relative h-24 w-full rounded-lg overflow-hidden border border-slate-200">
                              <Image src={planForm.image} alt="Preview" fill className="object-cover" />
                              <button type="button" onClick={() => setPlanForm({...planForm, image: ''})} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"><X size={12}/></button>
                           </div>
                        )}
                    </div>
                 </div>
              </div>

              <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mô tả</label>
                  <textarea className="w-full p-3 border rounded-lg bg-white dark:bg-black dark:border-slate-700 h-20 resize-none" value={planForm.desc} onChange={e => setPlanForm({...planForm, desc: e.target.value})} />
              </div>

              <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Trạng thái bán</label>
                  <div className="flex gap-4">
                     <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg w-full dark:border-slate-700">
                        <input type="radio" checked={planForm.isActive === true} onChange={() => setPlanForm({...planForm, isActive: true})} className="accent-green-600"/>
                        <span className="text-sm font-medium">Active (Đang bán)</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg w-full dark:border-slate-700">
                        <input type="radio" checked={planForm.isActive === false} onChange={() => setPlanForm({...planForm, isActive: false})} className="accent-slate-500"/>
                        <span className="text-sm font-medium">Inactive (Ngưng)</span>
                     </label>
                  </div>
              </div>

            </form>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
              <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">Hủy</button>
              <button onClick={handlePlanSubmit} disabled={isSaving || isUploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg disabled:opacity-50">{isSaving ? "Đang lưu..." : "Lưu gói"}</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL 2: PROMOTION === */}
      {isPromoModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-yellow-400/50">
             <div className="p-5 border-b bg-yellow-50 dark:bg-yellow-900/10 flex justify-between items-center">
                <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-500">Tạo khuyến mãi</h3>
                <button onClick={() => setIsPromoModalOpen(false)}><X size={20}/></button>
             </div>
             <form onSubmit={handlePromoSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm mb-1">Tên KM</label>
                    <input className="w-full p-2 border rounded dark:bg-black" value={promoForm.name} onChange={e => setPromoForm({...promoForm, name: e.target.value})} required/>
                 </div>
                 <div>
                    <label className="block text-sm mb-1">Giá giảm (VNĐ)</label>
                    <input type="number" className="w-full p-2 border rounded dark:bg-black text-red-600 font-bold" value={promoForm.salePrice} onChange={e => setPromoForm({...promoForm, salePrice: Number(e.target.value)})} required/>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm mb-1">Bắt đầu</label><input type="date" className="w-full p-2 border rounded dark:bg-black" value={promoForm.startDate} onChange={e => setPromoForm({...promoForm, startDate: e.target.value})} required/></div>
                    <div><label className="block text-sm mb-1">Kết thúc</label><input type="date" className="w-full p-2 border rounded dark:bg-black" value={promoForm.endDate} onChange={e => setPromoForm({...promoForm, endDate: e.target.value})} required/></div>
                 </div>
                 <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsPromoModalOpen(false)} className="px-3 py-2 border rounded">Hủy</button>
                    <button type="submit" disabled={isSaving} className="px-3 py-2 bg-yellow-500 text-white rounded">Áp dụng</button>
                 </div>
             </form>
          </div>
        </div>
      )}

      {/* === MODAL 3: CLASS MANAGER & SCHEDULE === */}
      {isClassManagerOpen && currentPlanForClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex h-[85vh] border border-slate-200 dark:border-slate-800">
            
            {/* CỘT TRÁI */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950 shrink-0">
               <div className="p-4 border-b">
                  <h3 className="font-bold text-slate-800 dark:text-white">{currentPlanForClass.name}</h3>
                  <p className="text-xs text-slate-500">Danh sách lớp học</p>
               </div>
               <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {gymClasses.length === 0 && <p className="text-center text-xs text-slate-400 mt-10">Chưa có lớp nào.</p>}
                  {gymClasses.map(cls => (
                     <div key={cls.id} onClick={() => setSelectedClassId(cls.id)} className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedClassId === cls.id ? 'bg-white shadow-md border-blue-600 dark:bg-slate-800 dark:border-blue-500' : 'border-transparent hover:bg-white dark:hover:bg-slate-900'}`}>
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{cls.name}</div>
                              <div className="text-xs text-slate-500">{cls._count.sessions} buổi học</div>
                           </div>
                           <button onClick={(e) => {e.stopPropagation(); handleDeleteGymClass(cls.id)}} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="p-3 border-t bg-white dark:bg-slate-900">
                  <form onSubmit={handleAddGymClass} className="flex gap-2">
                     <input className="flex-1 text-sm p-2 border rounded dark:bg-black dark:border-slate-700" placeholder="Thêm lớp..." value={newClassName} onChange={e => setNewClassName(e.target.value)} required />
                     <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Plus size={18}/></button>
                  </form>
               </div>
            </div>

            {/* CỘT PHẢI - CALENDAR */}
            {/* FORCE LIGHT MODE HERE: bg-white và text-slate-900 */}
            <div className="flex-1 flex flex-col bg-white text-slate-900 relative">
               <div className="p-4 border-b flex justify-between items-center h-16 shrink-0 border-slate-200">
                  {selectedClassId ? (
                     <h3 className="font-bold text-slate-800 flex items-center gap-2"><CalIcon size={18} className="text-blue-500"/> TKB: {gymClasses.find(c => c.id === selectedClassId)?.name}</h3>
                  ) : <h3 className="text-slate-400 italic">Chọn một lớp để xem lịch</h3>}
                  <div className="flex gap-2">
                     {selectedClassId && <button onClick={openScheduleForm} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1 shadow-sm"><Plus size={16}/> Thêm lịch</button>}
                     <button onClick={() => setIsClassManagerOpen(false)} className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700">Đóng</button>
                  </div>
               </div>
               
               <div className="flex-1 p-4 overflow-hidden relative isolate">
                  {/* STYLE HACK: Override CSS variables để Calendar luôn sáng sủa */}
                  <style jsx global>{`
                    .rbc-calendar { color: #1e293b !important; } /* slate-800 */
                    .rbc-off-range-bg { background-color: #f1f5f9 !important; } /* slate-100 */
                    .rbc-header { color: #0f172a !important; font-weight: bold; border-bottom-color: #e2e8f0 !important; }
                    .rbc-day-bg + .rbc-day-bg { border-left-color: #e2e8f0 !important; }
                    .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: #cbd5e1 !important; }
                    .rbc-month-row + .rbc-month-row { border-top-color: #e2e8f0 !important; }
                    .rbc-timeslot-group { border-bottom-color: #e2e8f0 !important; }
                    .rbc-day-slot .rbc-time-slot { border-top-color: #e2e8f0 !important; }
                    .rbc-time-header.rbc-overflowing { border-right-color: #e2e8f0 !important; }
                    .rbc-time-content { border-top-color: #e2e8f0 !important; }
                    .rbc-time-gutter .rbc-timeslot-group { border-bottom-color: #e2e8f0 !important; }
                    .rbc-label { color: #64748b !important; }
                    .rbc-current-time-indicator { background-color: #3b82f6 !important; }
                  `}</style>

                  {selectedClassId ? (
                     <Calendar localizer={localizer} events={events} startAccessor="start" view={view} date={date} onView={(view) => setView(view)} onNavigate={(date) => setDate(date)} endAccessor="end" style={{ height: '100%' }} views={[Views.MONTH, Views.WEEK]} defaultView={Views.WEEK} culture='vi' eventPropGetter={() => ({ className: 'bg-blue-100 text-blue-700 border-l-4 border-blue-600 text-xs font-semibold' })} />
                  ) : <div className="absolute inset-0 flex items-center justify-center text-slate-300 flex-col"><Layers size={48} className="mb-2 opacity-50"/><p>Vui lòng chọn lớp học bên trái</p></div>}
               </div>

               {/* FORM POPUP SCHEDULE */}
               {isScheduleFormOpen && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-slate-900 p-6 rounded-xl shadow-2xl border border-slate-200 w-96 z-10 animate-in zoom-in-95">
                    <h4 className="font-bold mb-4 text-lg">Thêm lịch học</h4>
                    <form onSubmit={handleCreateSchedule} className="space-y-3">
                       <div>
                          <label className="text-xs font-bold text-slate-500">Huấn luyện viên</label>
                          <select className="w-full p-2 border rounded text-sm bg-white" onChange={e => setScheduleForm({...scheduleForm, trainerId: e.target.value})} required>
                             <option value="">-- Chọn HLV --</option>
                             {scheduleResources.trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500">Phòng tập</label>
                          <select className="w-full p-2 border rounded text-sm bg-white" onChange={e => setScheduleForm({...scheduleForm, roomId: e.target.value})} required>
                             <option value="">-- Chọn Phòng --</option>
                             {scheduleResources.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-xs text-slate-500">Bắt đầu</label><input type="time" className="w-full p-2 border rounded text-sm bg-white" value={scheduleForm.startTime} onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})} required/></div>
                          <div><label className="text-xs text-slate-500">Phút</label><input type="number" className="w-full p-2 border rounded text-sm bg-white" value={scheduleForm.durationMinutes} onChange={e => setScheduleForm({...scheduleForm, durationMinutes: Number(e.target.value)})}/></div>
                       </div>
                       <div>
                          <label className="text-xs text-slate-500 mb-1 block">Lặp lại thứ:</label>
                          <div className="flex gap-1 justify-between">
                             {['CN','T2','T3','T4','T5','T6','T7'].map((d, i) => (
                                <button key={i} type="button" onClick={() => handleDaySelect(i)} className={`w-8 h-8 rounded text-xs font-bold ${scheduleForm.repeatDays.includes(i) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{d}</button>
                             ))}
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-xs text-slate-500">Từ</label><input type="date" className="w-full p-2 border rounded text-sm bg-white" value={scheduleForm.startDate} onChange={e => setScheduleForm({...scheduleForm, startDate: e.target.value})} required/></div>
                          <div><label className="text-xs text-slate-500">Đến</label><input type="date" className="w-full p-2 border rounded text-sm bg-white" value={scheduleForm.endDate} onChange={e => setScheduleForm({...scheduleForm, endDate: e.target.value})} required/></div>
                       </div>
                       <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setIsScheduleFormOpen(false)} className="flex-1 py-2 border rounded text-sm hover:bg-slate-50">Hủy</button>
                          <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-blue-600 text-white rounded text-sm shadow-lg">{isSaving ? '...' : 'Lưu'}</button>
                       </div>
                    </form>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}