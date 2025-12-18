"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  getRooms, 
  getEquipments, 
  updateEquipment, 
  createEquipment, 
  getCategoriesByRoom, 
  createQuickCategory, 
  deleteQuickCategory, 
  deleteEquipment, 
  type EquipmentWithDetails, 
  type RoomWithCategories 
} from '@/actions/admin-equipment';
import { EquipmentStatus } from '@prisma/client';
import { Filter, Wrench, CheckCircle, XCircle, Search, Edit, Plus, Upload, Image as ImageIcon, X, Trash2, Save, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

type SimpleCategory = { id: string; name: string };

// Helper upload ảnh
const uploadImageToServer = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) return data.url;
  } catch (error) { console.error("Lỗi upload ảnh:", error); }
  return null;
};

export default function EquipmentManagementPage() {
  // --- STATE ---
  const [equipments, setEquipments] = useState<EquipmentWithDetails[]>([]);
  const [rooms, setRooms] = useState<RoomWithCategories[]>([]);
  const [loading, setLoading] = useState(true); // Loading lần đầu hoặc khi đổi filter
  const [isTableLoading, setIsTableLoading] = useState(true); // Loading riêng cho bảng (để hiện Skeleton)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Filter
  const [filterRoom, setFilterRoom] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Forms
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentWithDetails | null>(null);
  const [newEquip, setNewEquip] = useState({
    code: '', name: '', roomId: '', categoryId: '', status: 'GOOD' as EquipmentStatus, 
    imageFile: null as File | null, imagePreview: '', origin: '', description: '', purchaseDate: '' 
  });
  const [editFormData, setEditFormData] = useState({
    code: '', name: '', roomId: '', categoryId: '', status: 'GOOD' as EquipmentStatus, 
    imageFile: null as File | null, imagePreview: '', origin: '', description: '', purchaseDate: '' 
  });

  const [availableCategories, setAvailableCategories] = useState<SimpleCategory[]>([]);
  const [isCreatingCat, setIsCreatingCat] = useState(false); 
  const [newCatName, setNewCatName] = useState('');          
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  // ================= FETCH DATA =================
  const loadData = useCallback(async () => {
    try {
      setIsTableLoading(true); // Bắt đầu load bảng -> Hiện Skeleton
      
      const [roomData, equipResult] = await Promise.all([
        getRooms(),
        getEquipments(filterRoom, filterStatus, currentPage, ITEMS_PER_PAGE)
      ]);
      
      setRooms(roomData);
      setEquipments(equipResult.data);
      setTotalPages(equipResult.totalPages);
      setTotalItems(equipResult.total);
      
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsTableLoading(false); // Tắt Skeleton
      setLoading(false);        // Tắt loading trang (nếu là lần đầu)
    }
  }, [filterRoom, filterStatus, currentPage, refreshKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => { setCurrentPage(1); }, [filterRoom, filterStatus]);

  const handleSuccessUpdate = () => {
    setRefreshKey(prev => prev + 1);
    loadData(); 
  };

  // ================= HANDLERS (Giữ nguyên logic cũ) =================
  const handleEditClick = async (item: EquipmentWithDetails) => {
    setEditingItem(item);
    if (item.category.roomId) { const cats = await getCategoriesByRoom(item.category.roomId); setAvailableCategories(cats); }
    const pDate = item.purchaseDate ? format(new Date(item.purchaseDate), 'yyyy-MM-dd') : '';
    setEditFormData({
      code: item.code, name: item.name || '', roomId: item.category.roomId, categoryId: item.categoryId, status: item.status,
      imageFile: null, imagePreview: item.image || '', origin: item.origin || '', description: item.description || '', purchaseDate: pDate
    });
  };
  const handleRoomChangeInEdit = async (roomId: string) => { setEditFormData(prev => ({ ...prev, roomId, categoryId: '' })); if (roomId) { const cats = await getCategoriesByRoom(roomId); setAvailableCategories(cats); } else { setAvailableCategories([]); }};
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingItem) return; setIsSaving(true);
    let finalImage = editFormData.imagePreview;
    if (editFormData.imageFile) { const url = await uploadImageToServer(editFormData.imageFile); if (url) finalImage = url; }
    const res = await updateEquipment(editingItem.id, {
      code: editFormData.code, name: editFormData.name, roomId: editFormData.roomId, categoryId: editFormData.categoryId, status: editFormData.status,
      image: finalImage, origin: editFormData.origin || undefined, description: editFormData.description || undefined, purchaseDate: editFormData.purchaseDate ? new Date(editFormData.purchaseDate) : undefined
    });
    setIsSaving(false); if (res.success) { setEditingItem(null); handleSuccessUpdate(); } else { alert("Lỗi: " + res.message); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newEquip.code || !newEquip.name || !newEquip.categoryId) { alert("Thiếu thông tin bắt buộc!"); return; } setIsSaving(true);
    let finalImage = undefined; if (newEquip.imageFile) { const url = await uploadImageToServer(newEquip.imageFile); if (url) finalImage = url; }
    const res = await createEquipment({
      code: newEquip.code, name: newEquip.name, roomId: newEquip.roomId, categoryId: newEquip.categoryId, 
      newCategoryName: isCreatingCat ? newCatName : undefined, status: newEquip.status, image: finalImage,
      origin: newEquip.origin || undefined, description: newEquip.description || undefined, purchaseDate: newEquip.purchaseDate ? new Date(newEquip.purchaseDate) : undefined
    });
    setIsSaving(false); if (res.success) { setIsAddOpen(false); setNewEquip({ code: '', name: '', roomId: '', categoryId: '', status: 'GOOD', imageFile: null, imagePreview: '', origin: '', description: '', purchaseDate: '' }); handleSuccessUpdate(); } else { alert(res.message); }
  };

  const handleDeleteEquipment = async (id: string, code: string) => {
    if (!confirm(`Xóa thiết bị [${code}]?`)) return; setEquipments(prev => prev.filter(item => item.id !== id)); 
    const res = await deleteEquipment(id); if (!res.success) { alert(res.message); handleSuccessUpdate(); } else { handleSuccessUpdate(); }
  };

  const handleRoomChangeInAdd = async (roomId: string) => { setNewEquip(prev => ({ ...prev, roomId, categoryId: '' })); setIsCreatingCat(false); if (roomId) { const cats = await getCategoriesByRoom(roomId); setAvailableCategories(cats); } else { setAvailableCategories([]); }};
  const handleQuickAddCategory = async () => { const activeRoomId = isAddOpen ? newEquip.roomId : editFormData.roomId; if (!newCatName.trim() || !activeRoomId) return; setIsSaving(true); const res = await createQuickCategory(activeRoomId, newCatName); setIsSaving(false); if (res.success && res.data) { const updatedCats = await getCategoriesByRoom(activeRoomId); setAvailableCategories(updatedCats); if (isAddOpen) setNewEquip(prev => ({ ...prev, categoryId: res.data!.id })); else setEditFormData(prev => ({ ...prev, categoryId: res.data!.id })); setIsCreatingCat(false); setNewCatName(''); } else { alert(res.message); }};
  const handleQuickDeleteCategory = async () => { const activeCatId = isAddOpen ? newEquip.categoryId : editFormData.categoryId; const activeRoomId = isAddOpen ? newEquip.roomId : editFormData.roomId; if (!activeCatId) return; if (!confirm("Xóa loại này?")) return; setIsSaving(true); const res = await deleteQuickCategory(activeCatId); setIsSaving(false); if (res.success) { const updatedCats = await getCategoriesByRoom(activeRoomId); setAvailableCategories(updatedCats); if (isAddOpen) setNewEquip(prev => ({ ...prev, categoryId: '' })); else setEditFormData(prev => ({ ...prev, categoryId: '' })); } else { alert(res.message); }};
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); if (isEdit) setEditFormData(prev => ({ ...prev, imageFile: file, imagePreview: url })); else setNewEquip(prev => ({ ...prev, imageFile: file, imagePreview: url })); }};

  // Render Helpers
  const filteredList = equipments.filter(item => item.code.toLowerCase().includes(searchTerm.toLowerCase()) || (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())));
  
  const renderStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'GOOD': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"><CheckCircle size={14}/> Tốt</span>;
      case 'MAINTENANCE': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"><Wrench size={14}/> Bảo trì</span>;
      case 'BROKEN': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"><XCircle size={14}/> Hỏng</span>;
    }
  };

  return (
    <div className="space-y-6 min-h-screen pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Thiết bị</h1></div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"><Plus size={18} /> Nhập thiết bị mới</button>
      </div>

      {/* FILTER */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
         <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 w-full lg:w-auto min-w-fit"><Filter size={18} /> <span className="text-sm font-medium">Bộ lọc:</span></div>
         <select className="p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 w-full lg:w-48 outline-none" value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}><option value="ALL">🏠 Tất cả phòng</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
         <select className="p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 w-full lg:w-48 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as EquipmentStatus | 'ALL')}><option value="ALL">📊 Tất cả trạng thái</option><option value="MAINTENANCE">🛠️ Đang bảo trì</option><option value="BROKEN">❌ Hỏng / Ngưng</option><option value="GOOD">✅ Hoạt động tốt</option></select>
         <div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Tìm kiếm trang hiện tại..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
               <tr><th className="p-4 w-24">Mã</th><th className="p-4">Tên & Loại</th><th className="p-4">Vị trí</th><th className="p-4 w-32">Trạng thái</th><th className="p-4 w-32">Bảo trì</th><th className="p-4 text-center w-24">Thao tác</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isTableLoading ? (
                // 👇 SKELETON LOADING (5 dòng giả)
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div></td>
                    <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="flex justify-center gap-2"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded"></div><div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded"></div></div></td>
                  </tr>
                ))
              ) : filteredList.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">Không tìm thấy thiết bị nào.</td></tr>
              ) : filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                  <td className="p-4"><span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">{item.code}</span></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       {item.image ? (
                         <img src={`${item.image}?v=${refreshKey}`} alt="" className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-700" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/> 
                       ) : (
                         <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><ImageIcon size={20}/></div>
                       )}
                       <div><div className="font-bold text-slate-800 dark:text-slate-200">{item.name}</div><div className="text-xs text-slate-500">{item.category.name}</div></div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{item.category.room.name}</td>
                  <td className="p-4">{renderStatusBadge(item.status)}</td>
                  <td className="p-4 text-slate-500 text-xs">{item.lastMaintained ? format(new Date(item.lastMaintained), 'dd/MM/yyyy') : '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEditClick(item)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit size={18} /></button>
                      <button onClick={() => item.status === 'BROKEN' && handleDeleteEquipment(item.id, item.code)} disabled={item.status !== 'BROKEN'} className={`p-2 rounded-lg transition-colors ${item.status === 'BROKEN' ? "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" : "text-slate-200 dark:text-slate-700 cursor-not-allowed"}`}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-950">
           <div className="text-sm text-slate-500 dark:text-slate-400">
              Trang <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span> / {totalPages} ({totalItems} kết quả)
           </div>
           
           <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isTableLoading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"><ChevronLeft size={16} /> Trước</button>
              
              <div className="flex gap-1 hidden sm:flex">
                 {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return <button key={pageNum} onClick={() => setCurrentPage(pageNum)} disabled={isTableLoading} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{pageNum}</button>
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) { return <span key={pageNum} className="text-slate-400 px-1 pt-1">...</span>; }
                    return null;
                 })}
              </div>

              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isTableLoading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">Sau <ChevronRight size={16} /></button>
           </div>
        </div>
      </div>

      {/* ================= ADD & EDIT MODALS (Giữ nguyên phần modal ở dưới vì không ảnh hưởng skeleton) ================= */}
      {/* ... (Phần Modal Add và Edit giữ nguyên như code trước để tiết kiệm không gian, logic không đổi) ... */}
      {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800 dark:text-white">Thêm thiết bị mới</h3><button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button></div>
                <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-6">
                     <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 flex flex-col gap-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hình ảnh</label><div className="relative w-full aspect-square bg-slate-50 dark:bg-black border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden">{newEquip.imagePreview ? <img src={newEquip.imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-400"><Upload size={32} /><span className="text-xs mt-2">Upload</span></div>}<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, false)} /></div></div>
                        <div className="flex-1 space-y-4">
                           <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tên thiết bị *</label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={newEquip.name} onChange={e => setNewEquip({...newEquip, name: e.target.value})} required /></div><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mã (Code) *</label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase" value={newEquip.code} onChange={e => setNewEquip({...newEquip, code: e.target.value.toUpperCase()})} required /></div></div>
                           <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                              <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Vị trí (Phòng) *</label><select className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={newEquip.roomId} onChange={e => handleRoomChangeInAdd(e.target.value)} required><option value="">-- Chọn --</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                              <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Loại thiết bị *</label>
                                 {isCreatingCat ? (<div className="flex gap-2 animate-in fade-in slide-in-from-left-2"><input type="text" className="flex-1 p-2.5 border-2 border-blue-500 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:outline-none" placeholder="Nhập tên loại mới..." value={newCatName} onChange={e => setNewCatName(e.target.value)} autoFocus /><button type="button" onClick={handleQuickAddCategory} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Save size={18}/></button><button type="button" onClick={() => setIsCreatingCat(false)} className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 rounded-lg"><RotateCcw size={18}/></button></div>) : (<div className="flex gap-2"><select className="flex-1 p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" value={newEquip.categoryId} onChange={e => setNewEquip({...newEquip, categoryId: e.target.value})} required disabled={!newEquip.roomId}><option value="">-- Chọn --</option>{availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button type="button" onClick={() => setIsCreatingCat(true)} disabled={!newEquip.roomId} className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"><Plus size={18}/></button><button type="button" onClick={handleQuickDeleteCategory} disabled={!newEquip.categoryId || newEquip.categoryId === 'NEW'} className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"><Trash2 size={18}/></button></div>)}
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Xuất xứ <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={newEquip.origin} onChange={e => setNewEquip({...newEquip, origin: e.target.value})} /></div><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ngày nhập <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><input type="date" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={newEquip.purchaseDate} onChange={e => setNewEquip({...newEquip, purchaseDate: e.target.value})} /></div></div>
                        </div>
                     </div>
                     <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mô tả <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><textarea className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" value={newEquip.description} onChange={e => setNewEquip({...newEquip, description: e.target.value})} /></div>
                     <div><label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Trạng thái</label><div className="grid grid-cols-3 gap-3">{['GOOD', 'MAINTENANCE', 'BROKEN'].map((st) => (<div key={st} onClick={() => setNewEquip({...newEquip, status: st as EquipmentStatus})} className={`p-3 border rounded-lg cursor-pointer text-center text-sm font-bold transition-all ${newEquip.status === st ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{st === 'GOOD' ? '✅ Tốt' : st === 'MAINTENANCE' ? '🛠️ Bảo trì' : '❌ Hỏng'}</div>))}</div></div>
                </form>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3"><button onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Hủy</button><button onClick={handleCreate} disabled={isSaving} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg disabled:opacity-50">{isSaving ? "Đang lưu..." : "Thêm thiết bị"}</button></div>
             </div>
          </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800 dark:text-white">Cập nhật thiết bị</h3><button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button></div>
            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-6">
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 flex flex-col gap-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hình ảnh</label><div className="relative w-full aspect-square bg-slate-50 dark:bg-black border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden group">{editFormData.imagePreview ? (<><img src={editFormData.imagePreview} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold">Đổi ảnh</span></div></>) : (<div className="flex flex-col items-center text-slate-400"><Upload size={32} /><span className="text-xs mt-2">Upload</span></div>)}<input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, true)} /></div></div>
                  <div className="flex-1 space-y-4">
                     <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tên thiết bị *</label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required /></div><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mã (Code) *</label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase" value={editFormData.code} onChange={e => setEditFormData({...editFormData, code: e.target.value.toUpperCase()})} required /></div></div>
                     <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Vị trí (Phòng) *</label><select className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editFormData.roomId} onChange={e => handleRoomChangeInEdit(e.target.value)} required><option value="">-- Chọn --</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Loại thiết bị *</label><div className="flex gap-2"><select className="flex-1 p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editFormData.categoryId} onChange={e => setEditFormData({...editFormData, categoryId: e.target.value})} required disabled={!editFormData.roomId}><option value="">-- Chọn --</option>{availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button type="button" onClick={handleQuickAddCategory} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Save size={18}/></button><button type="button" onClick={handleQuickDeleteCategory} disabled={!editFormData.categoryId} className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"><Trash2 size={18}/></button></div></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Xuất xứ <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editFormData.origin} onChange={e => setEditFormData({...editFormData, origin: e.target.value})} /></div><div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ngày nhập <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><input type="date" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editFormData.purchaseDate} onChange={e => setEditFormData({...editFormData, purchaseDate: e.target.value})} /></div></div>
                  </div>
               </div>
               <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mô tả <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><textarea className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} /></div>
               <div><label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Trạng thái</label><div className="grid grid-cols-3 gap-3">{['GOOD', 'MAINTENANCE', 'BROKEN'].map((st) => (<div key={st} onClick={() => setEditFormData({...editFormData, status: st as EquipmentStatus})} className={`p-3 border rounded-lg cursor-pointer text-center text-sm font-bold transition-all ${editFormData.status === st ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{st === 'GOOD' ? '✅ Tốt' : st === 'MAINTENANCE' ? '🛠️ Bảo trì' : '❌ Hỏng'}</div>))}</div></div>
            </form>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3"><button onClick={() => setEditingItem(null)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Hủy</button><button onClick={handleUpdate} disabled={isSaving} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg disabled:opacity-50">{isSaving ? "Lưu thay đổi" : "Lưu thay đổi"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}