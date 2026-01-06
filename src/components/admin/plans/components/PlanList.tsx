"use client";
import React from 'react';
import { PlanWithPromo } from '@/types/admin/plan';
import PlanCard from './PlanCard';

interface PlanListProps {
  plans: PlanWithPromo[];
  loading: boolean;
  userRole: 'ADMIN' | 'STAFF';
  onEdit: (p: PlanWithPromo) => void;
  onDelete: (id: string, count: number) => void;
  onPromo: (p: PlanWithPromo) => void;
  onStopPromo: (id: string) => void;
  onClassManager: (p: PlanWithPromo) => void;
}

export default function PlanList({ 
  plans, loading, userRole, 
  onEdit, onDelete, onPromo, onStopPromo, onClassManager 
}: PlanListProps) {
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return <p className="text-slate-500 text-center py-10">Chưa có gói tập nào.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map(plan => (
        <PlanCard 
          key={plan.id} 
          plan={plan} 
          userRole={userRole}
          onEdit={onEdit}
          onDelete={onDelete}
          onPromo={onPromo}
          onStopPromo={onStopPromo}
          onClassManager={onClassManager}
        />
      ))}
    </div>
  );
}