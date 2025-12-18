'use server'

import prisma  from '@/lib/prisma'

export async function getPlans() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc', 
      },
      // --- THÊM ĐOẠN NÀY ---
      include: {
        promotions: true, // <--- BẮT BUỘC: Lấy kèm danh sách khuyến mãi
        // Nếu bạn muốn hiển thị số người đang đăng ký (cái chấm xanh), thêm dòng dưới:
        // _count: { select: { subscriptions: true } } 
      }
      // ---------------------
    });
    return plans;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }
}