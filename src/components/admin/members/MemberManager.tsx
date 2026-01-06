"use client";

import React, { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { useMember } from '@/hooks/admin/useMember';
import { MemberWithDetails } from '@/types/admin/member';

// Import Sub-components (Clean Architecture)
import MemberTable from './components/MemberTable';
import MemberFilters from './components/MemberFilters'; // Bạn tự tạo file này (Input Search)
import MemberPagination from './components/MemberPagination'; // Bạn tự tạo file này (Copy từ EquipmentPagination)
import MemberCreateModal from './components/MemberCreateModal';
import MemberEditModal from './components/MemberEditModal'; // Bạn tự tạo (Copy logic Edit form cũ)
import MemberDetailModal from './components/MemberDetailModal'; // Bạn tự tạo (Copy logic View modal cũ)
import CredentialModal from './components/CredentialModal'; // Bạn tự tạo (Copy logic Credential modal cũ)

interface MemberManagerProps {
  userRole: 'ADMIN' | 'STAFF';
}

export default function MemberManager({ userRole }: MemberManagerProps) {
  // 1. Hook Logic
  const { 
    members, plans, loading, pagination, search, setSearch, 
    actions 
  } = useMember();

  // 2. UI State
  const [modalType, setModalType] = useState<'NONE' | 'CREATE' | 'VIEW' | 'EDIT'>('NONE');
  const [selectedMember, setSelectedMember] = useState<MemberWithDetails | null>(null);
  const [credentialInfo, setCredentialInfo] = useState<{email: string, password: string} | null>(null);

  // 3. Handlers
  const handleCreateSubmit = async (data: any) => {
    const res = await actions.createMember(data);
    if (res.success) {
        setModalType('NONE');
        if (res.newAccount) setCredentialInfo(res.newAccount);
        else alert(res.message);
    } else alert(res.message);
  };

  const handleDelete = (m: MemberWithDetails) => {
     if(confirm(`Xóa ${m.name}?`)) actions.deleteItem(m.id);
  };

  return (
    <div className="space-y-6 min-h-screen pb-20 p-4 lg:p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
               Quản Lý Hội Viên {userRole === 'ADMIN' && <Shield size={18} className="text-red-500"/>}
           </h1>
           <p className="text-sm text-slate-500">Quản lý thông tin, gói tập và lịch sử.</p>
        </div>
        <button onClick={() => setModalType('CREATE')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex gap-2">
           <Plus size={18} /> Đăng ký mới
        </button>
      </div>

      {/* FILTERS */}
      <MemberFilters search={search} setSearch={setSearch} />

      {/* TABLE */}
      <MemberTable 
         members={members} 
         loading={loading} 
         userRole={userRole}
         onView={(m) => { setSelectedMember(m); setModalType('VIEW'); }}
         onEdit={(m) => { setSelectedMember(m); setModalType('EDIT'); }}
         onDelete={handleDelete}
      />

      {/* PAGINATION */}
      <MemberPagination 
         currentPage={pagination.currentPage} 
         totalPages={pagination.totalPages} 
         totalItems={pagination.total} 
         onPageChange={actions.changePage} 
      />

      {/* MODALS */}
      {modalType === 'CREATE' && (
         <MemberCreateModal 
            plans={plans} 
            onClose={() => setModalType('NONE')} 
            onSubmit={handleCreateSubmit} 
         />
      )}
      
      {modalType === 'EDIT' && selectedMember && (
         <MemberEditModal 
            member={selectedMember} 
            userRole={userRole}
            onClose={() => setModalType('NONE')} 
            onSubmit={actions.updateMember}
            onChangePass={actions.changePassword}
         />
      )}

      {modalType === 'VIEW' && selectedMember && (
         <MemberDetailModal 
            member={selectedMember} 
            onClose={() => setModalType('NONE')} 
         />
      )}

      {credentialInfo && (
         <CredentialModal 
            info={credentialInfo} 
            onClose={() => setCredentialInfo(null)} 
         />
      )}
    </div>
  );
}