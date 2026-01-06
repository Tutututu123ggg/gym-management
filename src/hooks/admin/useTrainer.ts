"use client";

import { useState } from 'react';
import { toggleTrainerCheckInAction } from '@/actions/trainer/trainer';
import { toast } from 'sonner'; 
import { useRouter } from 'next/navigation';

export function useTrainerCheckIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckIn = async (userId: string) => {
    setLoading(true);
    try {
      const res = await toggleTrainerCheckInAction(userId);
      if (res.success) {
        toast.success(res.message);
        router.refresh(); 
        // Trả về true để component biết là thành công mà reload data
        return true; 
      } else {
        toast.error(res.message);
        return false;
      }
    } catch (error) {
      toast.error('Lỗi hệ thống');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleCheckIn };
}