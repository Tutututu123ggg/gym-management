"use client";
import React, { useState } from 'react';
import { X, Plus, Layers, Calendar as CalIcon } from 'lucide-react';
import { PlanWithPromo } from '@/types/admin/plan';
import { useClassSchedule } from '@/hooks/admin/useClassSchedule';

// Sub components
import ClassSidebar from './ClassSidebar';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleFormModal from './ScheduleFormModal';

interface Props {
  isOpen: boolean;
  plan: PlanWithPromo;
  userRole: 'ADMIN' | 'STAFF';
  onClose: () => void;
}

export default function ClassManagerModal({ isOpen, plan, userRole, onClose }: Props) {
  if (!isOpen) return null;

  const { classes, selectedClassId, setSelectedClassId, events, resources, actions } = useClassSchedule(plan.id);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex h-[85vh] border border-slate-200 dark:border-slate-800">
        
        {/* LEFT SIDEBAR: CLASS LIST */}
        <ClassSidebar 
          planName={plan.name}
          classes={classes}
          selectedId={selectedClassId}
          onSelect={setSelectedClassId}
          onAdd={actions.addClass}
          onDelete={actions.removeClass}
          isAdmin={userRole === 'ADMIN'}
        />

        {/* RIGHT CONTENT: CALENDAR */}
        <div className="flex-1 flex flex-col bg-white text-slate-900 relative">
           <div className="p-4 border-b flex justify-between items-center h-16 shrink-0 border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <CalIcon size={18} className="text-blue-500"/> 
                 {selectedClassId ? `TKB: ${classes.find(c => c.id === selectedClassId)?.name}` : 'Lịch trình'}
              </h3>
              <div className="flex gap-2">
                 {userRole === 'ADMIN' && selectedClassId && (
                    <button onClick={() => setIsScheduleFormOpen(true)} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1 shadow-sm">
                       <Plus size={16}/> Thêm lịch
                    </button>
                 )}
                 <button onClick={onClose} className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700">Đóng</button>
              </div>
           </div>
           
           <div className="flex-1 p-4 overflow-hidden relative isolate">
              {selectedClassId ? (
                 <ScheduleCalendar events={events} />
              ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-300 flex-col">
                    <Layers size={48} className="mb-2 opacity-50"/>
                    <p>Vui lòng chọn lớp học bên trái</p>
                 </div>
              )}
           </div>

           {/* SCHEDULE FORM POPUP */}
           {isScheduleFormOpen && selectedClassId && (
              <ScheduleFormModal 
                 trainers={resources.trainers}
                 rooms={resources.rooms}
                 onClose={() => setIsScheduleFormOpen(false)}
                 onSubmit={async (data) => {
                    const res = await actions.createSchedule({ ...data, gymClassId: selectedClassId });
                    alert(res.message);
                    if (res.success) setIsScheduleFormOpen(false);
                 }}
              />
           )}
        </div>
      </div>
    </div>
  );
}