"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlans } from '@/hooks/admin/usePlans';
import { PlanWithPromo } from '@/types/admin/plan';

// Components
import PlanList from './components/PlanList';
import PlanModal from './components/PlanModal';
import PromoModal from './components/PromoModal';
import ClassManagerModal from './components/class-manager/ClassManagerModal';

interface Props { userRole: 'ADMIN' | 'STAFF'; }

export default function PlansManager({ userRole }: Props) {
  const { plans, loading, actions } = usePlans();
  
  // Modals State
  const [modalMode, setModalMode] = useState<'NONE' | 'CREATE_PLAN' | 'EDIT_PLAN' | 'PROMO' | 'CLASS'>('NONE');
  const [selectedPlan, setSelectedPlan] = useState<PlanWithPromo | null>(null);

  // Handlers
  const handleOpenCreate = () => { setSelectedPlan(null); setModalMode('CREATE_PLAN'); };
  const handleOpenEdit = (p: PlanWithPromo) => { setSelectedPlan(p); setModalMode('EDIT_PLAN'); };
  const handleOpenPromo = (p: PlanWithPromo) => { setSelectedPlan(p); setModalMode('PROMO'); };
  const handleOpenClass = (p: PlanWithPromo) => { setSelectedPlan(p); setModalMode('CLASS'); };

  const handlePlanSubmit = async (data: any) => {
    const res = await actions.savePlan(data);
    if (res.success) setModalMode('NONE'); else alert(res.message);
  };

  return (
    <div className="space-y-6 h-full pb-20">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gói tập & Dịch vụ</h1>
          <p className="text-sm text-slate-500">Quản lý gói, khuyến mãi và lịch học.</p>
        </div>
        {userRole === 'ADMIN' && (
          <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Gói mới
          </button>
        )}
      </div>

      <PlanList 
        plans={plans} 
        loading={loading} 
        userRole={userRole}
        onEdit={handleOpenEdit}
        onDelete={actions.removePlan}
        onPromo={handleOpenPromo}
        onStopPromo={actions.stopPromo}
        onClassManager={handleOpenClass}
      />

      {/* MODALS */}
      {(modalMode === 'CREATE_PLAN' || modalMode === 'EDIT_PLAN') && (
        <PlanModal 
          isOpen={true} 
          plan={selectedPlan} 
          onClose={() => setModalMode('NONE')} 
          onSubmit={handlePlanSubmit} 
        />
      )}

      {modalMode === 'PROMO' && selectedPlan && (
        <PromoModal 
          isOpen={true} 
          plan={selectedPlan} 
          onClose={() => setModalMode('NONE')} 
          onSubmit={(data) => actions.applyPromo(selectedPlan.id, data).then(() => setModalMode('NONE'))} 
        />
      )}

      {modalMode === 'CLASS' && selectedPlan && (
        <ClassManagerModal 
          isOpen={true} 
          plan={selectedPlan} 
          userRole={userRole}
          onClose={() => setModalMode('NONE')} 
        />
      )}
    </div>
  );
}