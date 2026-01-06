"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEquipment } from '@/hooks/admin/useEquipment';
import { EquipmentWithDetails } from '@/types/admin/equipment';

// Import các mảnh ghép
import EquipmentFilters from './components/EquipmentFilters';
import EquipmentTable from './components/EquipmentTable';
import EquipmentPagination from './components/EquipmentPagination';
import EquipmentModal from './components/EquipmentModal';

interface EquipmentManagerProps {
  userRole: 'ADMIN' | 'STAFF';
}

export default function EquipmentManager({ userRole }: EquipmentManagerProps) {
  // 1. Hook (Logic Layer)
  const { 
    equipments, rooms, loading, isTableLoading, pagination, 
    filters, setFilters, actions 
  } = useEquipment();

  // 2. Local UI State (Modal visibility)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentWithDetails | null>(null);

  // 3. Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EquipmentWithDetails) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (userRole !== 'ADMIN') return;
    if (confirm(`Xóa thiết bị [${code}]?`)) {
        const res = await actions.deleteItem(id);
        if (!res.success) alert(res.message);
    }
  };

  return (
    <div className="space-y-6 h-full pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Thiết bị</h1>
            <p className="text-sm text-slate-500">
                {userRole === 'ADMIN' ? 'Giao diện Quản trị viên (Full Control)' : 'Giao diện Nhân viên (Hỗ trợ kiểm kê)'}
            </p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={18} /> Nhập thiết bị mới
        </button>
      </div>

      {/* FILTER */}
      <EquipmentFilters 
        rooms={rooms}
        filters={filters} 
        setFilters={setFilters} 
      />

      {/* TABLE & PAGINATION */}
      <div className="flex flex-col">
          <EquipmentTable 
            data={equipments} 
            loading={isTableLoading} 
            userRole={userRole} 
            onEdit={handleOpenEdit} 
            onDelete={handleDelete} 
          />
          <EquipmentPagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            loading={isTableLoading}
            onPageChange={actions.changePage}
          />
      </div>

      {/* MODAL (Dùng chung cho Add/Edit) */}
      <EquipmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        rooms={rooms}
        userRole={userRole}
        fetchCategories={actions.fetchCategories}
        onSubmit={actions.submitEquipment}
        onQuickCategory={actions.handleQuickCategory}
      />
    </div>
  );
}