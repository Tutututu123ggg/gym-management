import { useState, useEffect, useCallback } from 'react';
import { getPlansAction, upsertPlanAction, deletePlanAction, applyPromoAction, stopPromoAction } from '@/actions/admin/admin-plan';
import { PlanWithPromo, UpsertPlanInput } from '@/types/admin/plan';

export function usePlans() {
  const [plans, setPlans] = useState<PlanWithPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const res = await getPlansAction();
    if (res.success) setPlans(res.data);
    setLoading(false);
  }, [refreshKey]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const refresh = () => setRefreshKey(k => k + 1);

  const savePlan = async (data: UpsertPlanInput) => {
    const res = await upsertPlanAction(data);
    if (res.success) refresh();
    return res;
  };

  const removePlan = async (id: string) => {
    const res = await deletePlanAction(id);
    if (res.success) refresh();
    return res;
  };

  const applyPromo = async (planId: string, data: any) => {
    const res = await applyPromoAction(planId, data);
    if (res.success) refresh();
    return res;
  };

  const stopPromo = async (id: string) => {
    const res = await stopPromoAction(id);
    if (res.success) refresh();
    return res;
  };

  return { plans, loading, refresh, actions: { savePlan, removePlan, applyPromo, stopPromo } };
}