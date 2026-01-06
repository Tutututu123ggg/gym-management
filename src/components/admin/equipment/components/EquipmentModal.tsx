"use client";
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { EquipmentStatus } from '@prisma/client';
import { EquipmentWithDetails, RoomWithCategories, SimpleCategory, EquipmentFormData } from '@/types/admin/equipment';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EquipmentWithDetails | null;
  rooms: RoomWithCategories[];
  userRole: 'ADMIN' | 'STAFF';
  
  // Logic callbacks
  fetchCategories: (roomId: string) => Promise<SimpleCategory[]>;
  onSubmit: (isEdit: boolean, id: string | null, data: any) => Promise<any>;
  onQuickCategory: (type: 'CREATE' | 'DELETE', payload: any) => Promise<any>;
}

// Hàm upload ảnh giả lập (hoặc gọi API thật)
const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.success ? data.url : null;
};

export default function EquipmentModal({ 
  isOpen, onClose, initialData, rooms, userRole, 
  fetchCategories, onSubmit, onQuickCategory 
}: Props) {
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  
  const [form, setForm] = useState<EquipmentFormData>({
    code: '', name: '', roomId: '', categoryId: '', status: 'GOOD',
    imageFile: null, imagePreview: '', origin: '', description: '', purchaseDate: '', newCategoryName: ''
  });

  // Load data khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          code: initialData.code,
          name: initialData.name || '',
          roomId: initialData.category.roomId,
          categoryId: initialData.categoryId,
          status: initialData.status,
          imagePreview: initialData.image || '',
          imageFile: null,
          origin: initialData.origin || '',
          description: initialData.description || '',
          purchaseDate: initialData.purchaseDate ? format(new Date(initialData.purchaseDate), 'yyyy-MM-dd') : '',
        });
        fetchCategories(initialData.category.roomId).then(setCategories);
      } else {
        // Reset form for Add mode
        setForm({
            code: '', name: '', roomId: '', categoryId: '', status: 'GOOD',
            imageFile: null, imagePreview: '', origin: '', description: '', purchaseDate: '', newCategoryName: ''
        });
        setCategories([]);
      }
      setIsCreatingCat(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Handlers
  const handleRoomChange = async (roomId: string) => {
    setForm(prev => ({ ...prev, roomId, categoryId: '' }));
    setIsCreatingCat(false);
    if (roomId) {
      const cats = await fetchCategories(roomId);
      setCategories(cats);
    } else {
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let finalImage = form.imagePreview;
    if (form.imageFile) {
        const url = await uploadImage(form.imageFile);
        if (url) finalImage = url;
    }

    const payload = {
        ...form,
        image: finalImage,
        purchaseDate: form.purchaseDate ? new Date(form.purchaseDate) : undefined,
        // map trường riêng cho BE
        newCategoryName: isCreatingCat ? form.newCategoryName : undefined,
        categoryId: isCreatingCat ? 'NEW' : form.categoryId
    };

    const res = await onSubmit(isEdit, initialData?.id || null, payload);
    setLoading(false);
    if (res.success) onClose();
    else alert(res.message);
  };

  const handleQuickCatAction = async (type: 'CREATE' | 'DELETE') => {
      const res = await onQuickCategory(type, {
          roomId: form.roomId,
          name: form.newCategoryName,
          categoryId: form.categoryId
      });
      
      if (res.success) {
          const updatedCats = await fetchCategories(form.roomId);
          setCategories(updatedCats);
          if (type === 'CREATE') {
              setIsCreatingCat(false);
              setForm(p => ({ ...p, categoryId: res.data.id }));
          } else {
              setForm(p => ({ ...p, categoryId: '' }));
          }
      } else {
          alert(res.message);
      }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setForm(p => ({ ...p, imageFile: file, imagePreview: URL.createObjectURL(file) }));
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
         <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{isEdit ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button>
         </div>
         
         <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
               {/* Image Upload */}
               <div className="w-full md:w-1/3 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hình ảnh</label>
                  <div className="relative w-full aspect-square bg-slate-50 dark:bg-black border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden group">
                     {form.imagePreview ? (
                        <><img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold">Đổi ảnh</span></div></>
                     ) : (
                        <div className="flex flex-col items-center text-slate-400"><Upload size={32} /><span className="text-xs mt-2">Upload</span></div>
                     )}
                     <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                  </div>
               </div>

               {/* Main Info */}
               <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tên thiết bị *</label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                     <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mã (Code) *</label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required /></div>
                  </div>
                  
                  {/* Category Section */}
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                     <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Vị trí (Phòng) *</label>
                        <select className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={form.roomId} onChange={e => handleRoomChange(e.target.value)} required>
                           <option value="">-- Chọn --</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Loại thiết bị *</label>
                        {isCreatingCat ? (
                           <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                              <input type="text" className="flex-1 p-2.5 border-2 border-blue-500 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:outline-none" placeholder="Nhập tên loại mới..." value={form.newCategoryName} onChange={e => setForm({...form, newCategoryName: e.target.value})} autoFocus />
                              <button type="button" onClick={() => handleQuickCatAction('CREATE')} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Save size={18}/></button>
                              <button type="button" onClick={() => setIsCreatingCat(false)} className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 rounded-lg"><RotateCcw size={18}/></button>
                           </div>
                        ) : (
                           <div className="flex gap-2">
                              <select className="flex-1 p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required disabled={!form.roomId}>
                                 <option value="">-- Chọn --</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <button type="button" onClick={() => setIsCreatingCat(true)} disabled={!form.roomId} className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"><Plus size={18}/></button>
                              {userRole === 'ADMIN' && <button type="button" onClick={() => handleQuickCatAction('DELETE')} disabled={!form.categoryId} className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"><Trash2 size={18}/></button>}
                           </div>
                        )}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Xuất xứ <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><input type="text" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 outline-none" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} /></div>
                     <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Ngày nhập <span className="text-xs text-slate-400 font-normal">(Opt)</span></label><input type="date" className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 outline-none" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} /></div>
                  </div>
               </div>
            </div>

            <div><label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mô tả</label><textarea className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            
            <div>
               <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Trạng thái</label>
               <div className="grid grid-cols-3 gap-3">
                  {['GOOD', 'MAINTENANCE', 'BROKEN'].map((st) => (
                     <div key={st} onClick={() => setForm({...form, status: st as EquipmentStatus})} className={`p-3 border rounded-lg cursor-pointer text-center text-sm font-bold transition-all ${form.status === st ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {st === 'GOOD' ? '✅ Tốt' : st === 'MAINTENANCE' ? '🛠️ Bảo trì' : '❌ Hỏng'}
                     </div>
                  ))}
               </div>
            </div>
         </form>

         <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Hủy</button>
            <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg disabled:opacity-50">{loading ? "Đang lưu..." : (isEdit ? "Lưu thay đổi" : "Thêm thiết bị")}</button>
         </div>
      </div>
    </div>
  );
}