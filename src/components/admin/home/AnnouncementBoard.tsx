import React, { useState } from 'react';
import { Bell, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Định nghĩa Interface ngay tại đây hoặc import từ @/types
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string; // Handle cả string nếu server trả về JSON chưa parse
}

interface Props {
  announcements: Announcement[];
  canManage: boolean; // Biến này quyết định xem user có quyền thêm/xóa không
  onAdd: (title: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function AnnouncementBoard({ announcements, canManage, onAdd, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    onAdd(title, content);
    
    // Reset form
    setTitle(""); 
    setContent(""); 
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col">
       {/* HEADER */}
       <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Bell className="text-red-500"/> Thông báo
          </h3>
          {canManage && (
             <button 
               onClick={() => setIsAdding(!isAdding)} 
               className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 font-bold flex items-center gap-1 transition-colors"
             >
                {isAdding ? <X size={14}/> : <Plus size={14}/>} 
                {isAdding ? 'Hủy' : 'Tạo mới'}
             </button>
          )}
       </div>

       {/* FORM TẠO MỚI (Chỉ hiện khi isAdding = true và có quyền) */}
       {isAdding && canManage && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 bg-blue-50 dark:bg-slate-950 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
             <input 
               type="text" 
               placeholder="Tiêu đề thông báo..." 
               className="w-full mb-2 px-3 py-2 rounded border border-blue-200 text-sm focus:outline-blue-500 bg-white dark:bg-slate-900" 
               value={title} 
               onChange={e => setTitle(e.target.value)} 
               autoFocus
             />
             <textarea 
               rows={3} 
               placeholder="Nội dung chi tiết..." 
               className="w-full mb-2 px-3 py-2 rounded border border-blue-200 text-sm focus:outline-blue-500 bg-white dark:bg-slate-900 resize-none" 
               value={content} 
               onChange={e => setContent(e.target.value)} 
             />
             <button 
               type="submit" 
               className="w-full bg-blue-600 text-white py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors"
             >
               Đăng thông báo
             </button>
          </form>
       )}
       
       {/* DANH SÁCH */}
       <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] custom-scrollbar pr-1">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm flex flex-col items-center">
              <Bell size={32} className="mb-2 opacity-20"/>
              Hiện không có thông báo nào.
            </div>
          ) : (
            announcements.map((item) => (
             <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border-l-4 border-l-blue-500 shadow-sm group relative hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                 <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1 pr-6">{item.title}</h4>
                 <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2 whitespace-pre-line">
                   {item.content}
                 </p>
                 <p className="text-[10px] text-slate-400 font-mono text-right">
                   {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                 </p>
                 
                 {/* Nút xóa (Chỉ hiện khi có quyền) */}
                 {canManage && (
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      title="Xóa thông báo"
                    >
                       <Trash2 size={14} />
                    </button>
                 )}
             </div>
            ))
          )}
       </div>
    </div>
  );
}