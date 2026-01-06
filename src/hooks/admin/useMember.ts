import { useState, useEffect, useCallback } from 'react';
import { 
  getMembersAction, getPlansForDropdownAction, 
  registerMemberAction, updateMemberAction, 
  deleteMemberAction, adminChangePasswordAction 
} from '@/actions/admin/admin-member';
import { MemberWithDetails, PlanWithPromo, CreateMemberInput, UpdateMemberInput } from '@/types/admin/member';

export function useMember() {
  // Data
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [plans, setPlans] = useState<PlanWithPromo[]>([]); // Để đổ vào dropdown
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  // Init fetch Plans (chỉ gọi 1 lần)
  useEffect(() => {
    getPlansForDropdownAction().then(res => {
        if(res.success && res.data) setPlans(res.data as any);
    });
  }, []);

  // Fetch Members
  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getMembersAction(search, pagination.currentPage);
    if (res.success && res.data) {
        setMembers(res.data.data);
        setPagination({
            currentPage: res.data.currentPage,
            totalPages: res.data.totalPages,
            total: res.data.total
        });
    }
    setLoading(false);
  }, [search, pagination.currentPage, refreshKey]);

  useEffect(() => { 
      const timer = setTimeout(() => fetchData(), 300); // Debounce
      return () => clearTimeout(timer);
  }, [fetchData]);

  // Actions exposed to UI
  const changePage = (p: number) => setPagination(prev => ({...prev, currentPage: p}));
  const refresh = () => setRefreshKey(k => k + 1);

  const createMember = async (data: CreateMemberInput) => {
      const res = await registerMemberAction(data);
      if (res.success) refresh();
      return res;
  };

  const updateMember = async (id: string, data: UpdateMemberInput) => {
      const res = await updateMemberAction(id, data);
      if (res.success) refresh();
      return res;
  };

  const changePassword = async (id: string, pass: string) => {
      return await adminChangePasswordAction(id, pass);
  };

  const deleteItem = async (id: string) => {
      const res = await deleteMemberAction(id);
      if (res.success) refresh();
      return res;
  };

  return {
    members, plans, loading, pagination, search, setSearch,
    actions: { changePage, refresh, createMember, updateMember, changePassword, deleteItem }
  };
}