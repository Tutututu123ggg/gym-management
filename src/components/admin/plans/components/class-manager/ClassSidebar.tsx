"use client";
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { GymClassWithStats } from '@/types/admin/plan';

interface ClassSidebarProps {
  planName: string;
  classes: GymClassWithStats[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  isAdmin: boolean;
}

export default function ClassSidebar({ 
  planName, classes, selectedId, onSelect, onAdd, onDelete, isAdmin 
}: ClassSidebarProps) {
  const [newClassName, setNewClassName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const res = await onAdd(newClassName);
    if (res?.success) setNewClassName(''); else alert(res?.message);
  };

  return (
    <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950 shrink-0">
       <div className="p-4 border-b">
          <h3 className="font-bold text-slate-800 dark:text-white">{planName}</h3>
          <p className="text-xs text-slate-500">Danh sách lớp học</p>
       </div>
       <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {classes.length === 0 && <p className="text-center text-xs text-slate-400 mt-10">Chưa có lớp nào.</p>}
          {classes.map(cls => (
             <div 
                key={cls.id} 
                onClick={() => onSelect(cls.id)} 
                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedId === cls.id ? 'bg-white shadow-md border-blue-600 dark:bg-slate-800 dark:border-blue-500' : 'border-transparent hover:bg-white dark:hover:bg-slate-900'}`}
             >
                <div className="flex justify-between items-start">
                   <div>
                      <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{cls.name}</div>
                      <div className="text-xs text-slate-500">{cls._count.sessions} buổi học</div>
                   </div>
                   {isAdmin && (
                      <button 
                        onClick={(e) => {e.stopPropagation(); onDelete(cls.id)}} 
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 size={14}/>
                      </button>
                   )}
                </div>
             </div>
          ))}
       </div>
       {isAdmin && (
           <div className="p-3 border-t bg-white dark:bg-slate-900">
             <form onSubmit={handleAdd} className="flex gap-2">
                <input className="flex-1 text-sm p-2 border rounded dark:bg-black dark:border-slate-700" placeholder="Thêm lớp..." value={newClassName} onChange={e => setNewClassName(e.target.value)} required />
                <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Plus size={18}/></button>
             </form>
           </div>
       )}
    </div>
  );
}