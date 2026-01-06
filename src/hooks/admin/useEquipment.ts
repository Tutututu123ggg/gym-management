import { useState, useEffect, useCallback } from 'react';
import { 
  getEquipmentsAction, getInitialData, deleteEquipmentAction, 
  getCategoriesByRoomAction, createCategoryAction, deleteCategoryAction,
  createEquipmentAction, updateEquipmentAction 
} from '@/actions/admin/admin-equipment';
import { EquipmentStatus } from '@prisma/client';
import { EquipmentWithDetails, RoomWithCategories, PaginatedResult } from '@/types/admin/equipment';

export function useEquipment() {
  // Data State
  const [equipments, setEquipments] = useState<EquipmentWithDetails[]>([]);
  const [rooms, setRooms] = useState<RoomWithCategories[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [filterRoom, setFilterRoom] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // Init Data (Rooms)
  useEffect(() => {
    getInitialData().then(setRooms);
  }, []);

  // Fetch List Data
  const fetchData = useCallback(async () => {
    setIsTableLoading(true);
    const res = await getEquipmentsAction(filterRoom, filterStatus, searchTerm, pagination.currentPage);
    setEquipments(res.data);
    setPagination(prev => ({ 
      ...prev, 
      totalPages: res.totalPages, 
      total: res.total,
      currentPage: res.currentPage 
    }));
    setIsTableLoading(false);
    setLoading(false);
  }, [filterRoom, filterStatus, searchTerm, pagination.currentPage, refreshKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page on filter change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [filterRoom, filterStatus, searchTerm]);

  // --- ACTIONS ---

  const refresh = () => setRefreshKey(k => k + 1);

  const changePage = (page: number) => setPagination(prev => ({ ...prev, currentPage: page }));

  const deleteItem = async (id: string) => {
    const res = await deleteEquipmentAction(id);
    if (res.success) refresh();
    return res;
  };

  // Helper để lấy danh mục con khi chọn phòng trong modal
  const fetchCategories = async (roomId: string) => {
    return await getCategoriesByRoomAction(roomId);
  };

  const handleQuickCategory = async (type: 'CREATE' | 'DELETE', payload: any) => {
    if (type === 'CREATE') {
      return await createCategoryAction(payload.roomId, payload.name);
    } else {
      return await deleteCategoryAction(payload.categoryId);
    }
  };

  const submitEquipment = async (isEdit: boolean, id: string | null, data: any) => {
    if (isEdit && id) {
      return await updateEquipmentAction(id, data);
    } else {
      return await createEquipmentAction(data);
    }
  };

  return {
    equipments, rooms, loading, isTableLoading, pagination,
    filters: { filterRoom, filterStatus, searchTerm },
    setFilters: { setFilterRoom, setFilterStatus, setSearchTerm },
    actions: { 
      changePage, deleteItem, refresh, 
      fetchCategories, handleQuickCategory, submitEquipment 
    }
  };
}