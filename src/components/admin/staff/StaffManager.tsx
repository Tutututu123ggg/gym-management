"use client";

import React from 'react';
import { useStaff } from '@/hooks/admin/useStaff';
import StaffHeader from './StaffHeader';
import StaffTable from './StaffTable';

export default function StaffManager() {
  const { 
    currentMonth, staffList, loading, edits, savingId, 
    actions 
  } = useStaff();

  return (
    <div className="w-full h-full min-h-screen space-y-6 pb-20 p-6 bg-gray-50 dark:bg-gray-900">
      
      <StaffHeader 
        currentMonth={currentMonth} 
        onChangeMonth={actions.changeMonth} 
      />

      <StaffTable 
        staffList={staffList}
        edits={edits}
        loading={loading}
        savingId={savingId}
        onInputChange={actions.handleInputChange}
        onUseSuggestion={actions.handleUseSuggestion}
        onSave={actions.saveKPI}
      />
      
    </div>
  );
}