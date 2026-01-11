'use server'

import prisma  from '@/lib/prisma'
import { protect } from '@/lib/auth-guard'; // [NEW]

export async function getPlans() {
  try {
    await protect([]); // 🔒 Yêu cầu đăng nhập mới xem được gói

    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc', 
      },
      include: {
        promotions: true, 
        // _count: { select: { subscriptions: true } } 
      }
    });
    return plans;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }
}