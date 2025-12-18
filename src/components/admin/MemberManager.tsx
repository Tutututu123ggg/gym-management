"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Search, Plus, User, CreditCard, Calendar, CheckCircle, XCircle, 
  X, Eye, EyeOff, Edit, Trash2, MapPin, Phone, 
  Key, Shield, Percent, ChevronLeft, ChevronRight // Thêm icon mũi tên
} from 'lucide-react';
import { getMembers, registerWalkIn, updateMember, deleteMember, adminUpdatePassword } from '@/actions/admin-member';
import { getPlans } from '@/actions/admin-plan'; 

// --- TYPES ---

interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
  metadata?: { total: number; totalPages: number; currentPage: number; limit: number }; // Thêm metadata phân trang
  newAccount?: { email: string; password: string };
}

// ... (Các interface SubscriptionData, BookingData, Member, PlanSimple giữ nguyên như cũ)
interface SubscriptionData {
  id: string;
  planId: string;
  plan: { name: string };
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
}

interface BookingData {
  id: string;
  bookedAt: string | Date;
  classSession: {
    startTime: string | Date;
    gymClass: { name: string };
    trainer: { name: string | null } | null;
  };
}

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  department: string | null;
  gender: string | null;
  dateOfBirth: string | Date | null;
  bio: string | null;
  totalCheckIns: number;
  totalHours: number;
  currentStreak: number;
  lastCheckIn: string | Date | null;
  subscriptions: SubscriptionData[];
  bookings: BookingData[];
  createdAt: string | Date;
}

interface PlanSimple {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  isActive?: boolean;
  promotions?: {
      startDate: string | Date;
      endDate: string | Date;
      salePrice: number;
      isActive: boolean;
  }[];
}

// --- FORM STATES ---
interface CreateFormState {
  name: string;
  email: string;
  phone: string;
  planId: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'POS';
}

interface EditFormState {
  name: string;
  phone: string;
  address: string;
  bio: string;
}

export default function MemberManager() {
  // --- STATE ---
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<PlanSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [randomSearchName, setRandomSearchName] = useState("search_init");

  // PAGINATION STATE (MỚI)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Modals
  const [modalType, setModalType] = useState<'NONE' | 'CREATE' | 'VIEW' | 'EDIT'>('NONE');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Forms & Processing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>({ name: '', email: '', phone: '', planId: '', paymentMethod: 'CASH' });
  const [editForm, setEditForm] = useState<EditFormState>({ name: '', phone: '', address: '', bio: '' });

  const [manualPassword, setManualPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [credentialModal, setCredentialModal] = useState<{title: string, email: string, password: string} | null>(null);

  useEffect(() => {
    setRandomSearchName(`search_${Math.random().toString(36).slice(2)}`);
  }, []);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
        // Gọi API getMembers với tham số page và limit
        const [memRes, planRes] = await Promise.all([
            getMembers(search, currentPage, ITEMS_PER_PAGE), 
            getPlans()
        ]);
        
        const memResult = memRes as ActionResult;
        
        if (memResult.success && Array.isArray(memResult.data)) {
            setMembers(memResult.data as Member[]);
            // Cập nhật thông tin phân trang từ Metadata
            if (memResult.metadata) {
                setTotalPages(memResult.metadata.totalPages);
                setTotalRecords(memResult.metadata.total);
            }
        }
        
        let rawPlans: any[] = [];
        if (Array.isArray(planRes)) rawPlans = planRes;
        else if ((planRes as any)?.data && Array.isArray((planRes as any).data)) rawPlans = (planRes as any).data;

        setPlans(rawPlans.filter((p: any) => p.isActive !== false).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            durationDays: p.durationDays,
            isActive: p.isActive,
            promotions: p.promotions
        })));

    } catch (error) {
        console.error("Failed to fetch data", error);
    } finally {
        setLoading(false);
    }
  };

  // Debounce search: Khi search đổi -> Reset về trang 1
  useEffect(() => {
    setCurrentPage(1); 
  }, [search]);

  // Khi page đổi hoặc search (đã debounce) -> Fetch lại
  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500); 
    return () => clearTimeout(timer);
  }, [search, currentPage]); // Thêm currentPage vào dependency

  // --- HELPERS & HANDLERS ---
  const getActivePromo = (plan: PlanSimple) => {
    if (!plan.promotions) return null;
    const now = new Date();
    return plan.promotions.find(p => p.isActive && new Date(now) >= new Date(p.startDate) && new Date(now) <= new Date(p.endDate));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.planId) return alert("Vui lòng chọn gói tập!");
    
    setIsSubmitting(true);
    const res = await registerWalkIn(createForm) as ActionResult;
    setIsSubmitting(false);

    if (res.success) {
        setModalType('NONE');
        setCreateForm({ name: '', email: '', phone: '', planId: '', paymentMethod: 'CASH' });
        fetchData(); // Reload data hiện tại

        if (res.newAccount) {
            setCredentialModal({
               title: "Đăng ký thành công",
               email: res.newAccount.email,
               password: res.newAccount.password
            });
        } else {
            alert(res.message);
        }
    } else {
        alert(res.message || "Có lỗi xảy ra");
    }
  };

  const openEdit = (mem: Member) => {
    setSelectedMember(mem);
    setEditForm({ name: mem.name || '', phone: mem.phone || '', address: mem.address || '', bio: mem.bio || '' });
    setManualPassword(""); 
    setModalType('EDIT');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setIsSubmitting(true);
    const res = await updateMember(selectedMember.id, editForm) as ActionResult;
    setIsSubmitting(false);
    if (res.success) {
        setModalType('NONE');
        fetchData();
        alert("Cập nhật thông tin thành công!");
    } else {
        alert(res.message || "Lỗi cập nhật");
    }
  };

  const handleAdminChangePass = async () => {
      if (!selectedMember || !manualPassword) return;
      if (manualPassword.length < 6) return alert("Mật khẩu phải từ 6 ký tự trở lên!");
      if (!confirm(`Xác nhận đổi mật khẩu cho hội viên "${selectedMember.name}"?`)) return;

      setIsSubmitting(true);
      const res = await adminUpdatePassword(selectedMember.id, manualPassword) as ActionResult;
      setIsSubmitting(false);

      if (res.success) {
          alert("Đổi mật khẩu thành công!");
          setManualPassword("");
      } else {
          alert(res.message || "Lỗi đổi mật khẩu");
      }
  };

  const handleDelete = async (mem: Member) => {
    const hasActiveSub = mem.subscriptions.some(s => s.isActive && new Date(s.endDate) >= new Date());
    if (hasActiveSub) return alert("Không thể xóa: Hội viên đang có gói tập còn hạn!");
    if (!confirm(`CẢNH BÁO: Xóa vĩnh viễn hội viên "${mem.name}"?`)) return;
    
    const res = await deleteMember(mem.id) as ActionResult;
    if (res.success) {
        // Nếu xóa xong mà trang hiện tại trống (do xóa hết item cuối cùng), lùi về 1 trang
        if (members.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else {
            fetchData();
        }
    } else alert(res.message || "Lỗi khi xóa");
  };

  // Pagination Handlers
  const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(p => p - 1);
  };
  const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const selectedPlanForCreate = plans.find(p => p.id === createForm.planId);
  const activePromoForCreate = selectedPlanForCreate ? getActivePromo(selectedPlanForCreate) : null;

  return (
    <div className="space-y-6 min-h-screen pb-20 p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Quản Lý Hội Viên</h1>
           <p className="text-sm text-slate-500">Tra cứu, đăng ký, chỉnh sửa thông tin & mật khẩu.</p>
        </div>
        <button onClick={() => setModalType('CREATE')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95">
           <Plus size={18} /> Đăng ký mới
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
         <input 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Tìm theo tên, email, sđt..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            name={randomSearchName}
            id={randomSearchName}
         />
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs uppercase font-semibold">
                   <tr>
                      <th className="p-4">Hội viên</th>
                      <th className="p-4">Liên hệ</th>
                      <th className="p-4">Gói hiện tại</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Thao tác</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                   ) : members.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">Không tìm thấy hội viên nào.</td></tr>
                   ) : members.map((mem) => {
                      const activeSub = mem.subscriptions.find(s => s.isActive && new Date(s.endDate) >= new Date());
                      return (
                         <tr key={mem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                     {mem.name?.[0]?.toUpperCase() || <User size={16}/>}
                                  </div>
                                  <div>
                                     <div className="font-medium text-slate-800 dark:text-white text-sm">{mem.name || "Unknown"}</div>
                                     <div className="text-xs text-slate-500">{mem.department || 'Thành viên'}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                               <div className="flex flex-col">
                                  <span>{mem.email}</span>
                                  <span className="text-xs opacity-70">{mem.phone || "---"}</span>
                               </div>
                            </td>
                            <td className="p-4 text-sm">
                               {activeSub ? <span className="font-medium text-slate-700 dark:text-slate-300">{activeSub.plan.name}</span> : <span className="text-slate-400 italic">--</span>}
                            </td>
                            <td className="p-4">
                               {activeSub ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide"><CheckCircle size={10} className="mr-1"/> Active</span>
                               ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide"><XCircle size={10} className="mr-1"/> Inactive</span>
                               )}
                            </td>
                            <td className="p-4 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => { setSelectedMember(mem); setModalType('VIEW'); }} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors" title="Xem chi tiết"><Eye size={16} /></button>
                                  <button onClick={() => openEdit(mem)} className="p-2 text-slate-400 hover:text-orange-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors" title="Sửa thông tin"><Edit size={16} /></button>
                                  <button onClick={() => handleDelete(mem)} className={`p-2 rounded-lg transition-colors ${activeSub ? 'text-slate-200 cursor-not-allowed bg-slate-50 dark:bg-slate-900' : 'text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800'}`} disabled={!!activeSub} title="Xóa"><Trash2 size={16} /></button>
                               </div>
                            </td>
                         </tr>
                      );
                   })}
                </tbody>
             </table>
         </div>

         {/* --- PAGINATION CONTROLS --- */}
         <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
             <div className="text-sm text-slate-500">
                 Hiển thị <span className="font-bold">{members.length}</span> / <span className="font-bold">{totalRecords}</span> kết quả
             </div>
             <div className="flex items-center gap-2">
                 <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage <= 1 || loading}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <ChevronLeft size={18} />
                 </button>
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
                    Trang {currentPage} / {totalPages || 1}
                 </span>
                 <button 
                    onClick={handleNextPage} 
                    disabled={currentPage >= totalPages || loading}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <ChevronRight size={18} />
                 </button>
             </div>
         </div>
      </div>

      {/* --- MODAL CREATE --- */}
      {modalType === 'CREATE' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Đăng ký mới</h3>
                  <button onClick={() => setModalType('NONE')} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
               </div>
               <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto">
                  <div className="space-y-3">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className="text-xs font-bold text-slate-500">Email *</label>
                           <input type="email" required className="w-full p-2.5 mt-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                  value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} placeholder="email@example.com" />
                           <p className="text-[10px] text-slate-400 mt-1 italic">* Hệ thống sẽ tự tìm hội viên cũ hoặc tạo tài khoản mới.</p>
                        </div>
                        <div className="col-span-1">
                           <label className="text-xs font-bold text-slate-500">Họ tên</label>
                           <input type="text" required className="w-full p-2.5 mt-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                  value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                           <label className="text-xs font-bold text-slate-500">Số điện thoại</label>
                           <input type="text" className="w-full p-2.5 mt-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                  value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} />
                        </div>
                     </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                     <label className="text-xs font-bold text-slate-500 block mb-2">Chọn gói dịch vụ *</label>
                     <select className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={createForm.planId} onChange={(e) => setCreateForm({...createForm, planId: e.target.value})} required>
                        <option value="">-- Chọn gói --</option>
                        {plans.map(p => {
                           const promo = getActivePromo(p);
                           return <option key={p.id} value={p.id}>{p.name} {promo ? `(🔥 KM: ${promo.salePrice.toLocaleString()})` : `(${p.price.toLocaleString()})`}</option>
                        })}
                     </select>
                     
                     {selectedPlanForCreate && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Thành tiền:</span>
                              <div className="flex flex-col items-end">
                                 {activePromoForCreate ? (
                                    <>
                                       <span className="font-bold text-lg text-red-600 dark:text-red-500">{activePromoForCreate.salePrice.toLocaleString()} VND</span>
                                       <span className="text-xs text-slate-400 line-through">{selectedPlanForCreate.price.toLocaleString()} VND</span>
                                    </>
                                 ) : <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{selectedPlanForCreate.price.toLocaleString()} VND</span>}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                        {['CASH', 'TRANSFER', 'POS'].map(m => (
                           <button key={m} type="button" onClick={() => setCreateForm({...createForm, paymentMethod: m as any})} 
                                   className={`py-2 text-xs font-bold rounded-lg border transition-all ${createForm.paymentMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                   {m === 'CASH' ? 'Tiền mặt' : (m === 'TRANSFER' ? 'Chuyển khoản' : 'Quẹt thẻ')}
                           </button>
                        ))}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
                     {isSubmitting ? 'Đang xử lý...' : 'Xác nhận & Thu tiền'}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* --- MODAL VIEW --- */}
      {modalType === 'VIEW' && selectedMember && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
               <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <button onClick={() => setModalType('NONE')} className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
                  <div className="flex gap-5 items-center">
                     <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white/30">
                        {selectedMember.name?.[0]?.toUpperCase()}
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold">{selectedMember.name}</h2>
                        <div className="flex gap-2 text-blue-100 text-sm mt-1">
                           <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider">{selectedMember.department || 'Hội viên tự do'}</span>
                           {selectedMember.gender && <span className="bg-white/20 px-2 py-0.5 rounded text-xs capitalize">{selectedMember.gender}</span>}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                     <div className="text-xs text-slate-500 uppercase font-bold">Check-in</div>
                     <div className="text-lg font-bold text-slate-800 dark:text-white">{selectedMember.totalCheckIns}</div>
                  </div>
                  <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                     <div className="text-xs text-slate-500 uppercase font-bold">Giờ tập</div>
                     <div className="text-lg font-bold text-slate-800 dark:text-white">{selectedMember.totalHours.toFixed(1)}h</div>
                  </div>
                  <div className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                     <div className="text-xs text-slate-500 uppercase font-bold">Chuỗi</div>
                     <div className="text-lg font-bold text-orange-500">🔥 {selectedMember.currentStreak}</div>
                  </div>
                  <div className="p-4 text-center">
                     <div className="text-xs text-slate-500 uppercase font-bold">Lần cuối</div>
                     <div className="text-sm font-medium text-slate-800 dark:text-white mt-1">
                        {selectedMember.lastCheckIn ? format(new Date(selectedMember.lastCheckIn), 'dd/MM HH:mm') : '--'}
                     </div>
                  </div>
               </div>
               
               <div className="p-6 overflow-y-auto space-y-8 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                     <div><span className="text-slate-500 block text-xs">Email</span><span className="font-medium text-slate-800 dark:text-slate-200 break-all">{selectedMember.email}</span></div>
                     <div><span className="text-slate-500 block text-xs">SĐT</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedMember.phone || "---"}</span></div>
                     <div><span className="text-slate-500 block text-xs">Ngày sinh</span><span className="font-medium text-slate-800 dark:text-slate-200">{selectedMember.dateOfBirth ? format(new Date(selectedMember.dateOfBirth), 'dd/MM/yyyy') : "---"}</span></div>
                     <div><span className="text-slate-500 block text-xs">Địa chỉ</span><span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={selectedMember.address || ""}>{selectedMember.address || "---"}</span></div>
                     <div className="col-span-2"><span className="text-slate-500 block text-xs">Ghi chú</span><p className="text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded mt-1 text-xs italic border border-slate-100 dark:border-slate-800">{selectedMember.bio || "Không có."}</p></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase flex items-center gap-2"><CreditCard size={16} className="text-green-500"/> Gói đăng ký</h4>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                           <table className="w-full text-xs text-left">
                              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500"><tr><th className="p-2">Gói</th><th className="p-2">Hết hạn</th><th className="p-2">TT</th></tr></thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                 {selectedMember.subscriptions?.length > 0 ? selectedMember.subscriptions.map((sub: any) => (
                                    <tr key={sub.id}><td className="p-2 font-medium">{sub.plan.name}</td><td className="p-2">{format(new Date(sub.endDate), 'dd/MM/yy')}</td><td className="p-2">{sub.isActive && new Date(sub.endDate) >= new Date() ? <span className="text-green-600 font-bold">Active</span> : <span className="text-slate-400">Hết</span>}</td></tr>
                                 )) : <tr><td colSpan={3} className="p-3 text-center italic text-slate-400">Trống</td></tr>}
                              </tbody>
                           </table>
                        </div>
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase flex items-center gap-2"><Calendar size={16} className="text-purple-500"/> Lớp đã học</h4>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                           <table className="w-full text-xs text-left">
                              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500"><tr><th className="p-2">Lớp</th><th className="p-2">Ngày</th><th className="p-2">HLV</th></tr></thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                 {selectedMember.bookings?.length > 0 ? selectedMember.bookings.map((bk: any) => (
                                    <tr key={bk.id}>
                                       <td className="p-2 font-medium">{bk.classSession.gymClass.name}</td>
                                       <td className="p-2">{format(new Date(bk.classSession.startTime), 'dd/MM')}</td>
                                       <td className="p-2 truncate max-w-[80px]">{bk.classSession.trainer?.name || "-"}</td>
                                    </tr>
                                 )) : <tr><td colSpan={3} className="p-3 text-center italic text-slate-400">Chưa học</td></tr>}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL EDIT --- */}
      {modalType === 'EDIT' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
               <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Cập nhật thông tin</h3>
                  <button onClick={() => setModalType('NONE')} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               
               <div className="p-6 space-y-8">
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                     <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide border-b border-blue-100 dark:border-blue-900 pb-1 mb-3">Thông tin chung</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1"><label className="text-xs font-bold text-slate-500">Họ tên</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                        <div className="col-span-1"><label className="text-xs font-bold text-slate-500">SĐT</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                        <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Địa chỉ</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} /></div>
                        <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Bio / Ghi chú</label><input type="text" className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-700 dark:text-white mt-1 text-sm" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} /></div>
                     </div>
                     <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors text-sm">Lưu thông tin</button>
                  </form>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                     <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2"><Key size={16}/> Đổi mật khẩu</h4>
                     <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 space-y-3">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Nhập mật khẩu mới để cấp lại cho khách hàng.</div>
                        <div className="relative">
                           <input type={showPassword ? "text" : "password"} className="w-full p-2.5 pr-10 border border-red-200 dark:border-red-900 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="Nhập mật khẩu mới..." value={manualPassword} autoComplete="new-password" name="new_password_field" onChange={(e) => setManualPassword(e.target.value)} />
                           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                        </div>
                        <button type="button" onClick={handleAdminChangePass} disabled={!manualPassword || isSubmitting} className="w-full py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 dark:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded font-bold transition-colors text-sm disabled:opacity-50">Cập nhật Mật khẩu</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL CREDENTIAL --- */}
      {credentialModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border-2 border-green-500 relative">
               <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Key size={32} /></div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{credentialModal.title}</h3>
                  <p className="text-slate-500 mb-6 text-sm">Vui lòng cung cấp thông tin đăng nhập dưới đây cho khách hàng.</p>
                  
                  <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 text-left">
                     <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-500 uppercase">Email</span><span className="font-mono font-bold text-slate-800 dark:text-white select-all">{credentialModal.email}</span></div>
                     <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-2"><span className="text-xs font-bold text-slate-500 uppercase">Mật khẩu mới</span><span className="font-mono font-bold text-xl text-blue-600 dark:text-blue-400 select-all tracking-wider">{credentialModal.password}</span></div>
                  </div>
                  <button onClick={() => setCredentialModal(null)} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all">Đã ghi lại thông tin</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}