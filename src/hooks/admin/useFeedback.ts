import { useState, useEffect, useCallback } from 'react';
import { getFeedbacks, replyFeedback, deleteFeedback } from '@/actions/admin/admin-feedback';
import { FeedbackWithUser, FeedbackFilterStatus, PaginationMetadata } from '@/types/admin/feedback';

export function useFeedback(initialFilter: FeedbackFilterStatus = 'ALL') {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FeedbackFilterStatus>(initialFilter);
  
  // Quản lý Pagination
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0, totalPages: 1, currentPage: 1, limit: 10
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getFeedbacks(filter, pagination.currentPage);
    if (res.success && res.data && res.metadata) {
      setFeedbacks(res.data);
      setPagination(res.metadata);
    } else {
      setFeedbacks([]);
    }
    setLoading(false);
  }, [filter, pagination.currentPage]);

  // Reset về trang 1 khi đổi filter
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [filter]);

  // Gọi fetch khi filter hoặc page thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReply = async (id: string, text: string) => {
    const res = await replyFeedback(id, text);
    if (res.success) fetchData();
    return res;
  };

  const handleDelete = async (id: string) => {
    const res = await deleteFeedback(id);
    if (res.success) fetchData();
    return res;
  };

  const changePage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
        setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  return {
    feedbacks,
    loading,
    pagination,
    filter,
    setFilter,
    changePage,
    replyFeedback: handleReply,
    deleteFeedback: handleDelete
  };
}