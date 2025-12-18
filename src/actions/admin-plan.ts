"use server";

import prisma from '@/lib/prisma';
import { PlanCategory, Prisma, Promotion } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Type: Plan kèm theo khuyến mãi ĐANG CHẠY (chỉ lấy 1 cái mới nhất)
export type PlanWithPromo = Prisma.PlanGetPayload<{
  include: {
    _count: { select: { subscriptions: true } };
    promotions: true; // Lấy danh sách để lọc ở code hoặc query
  }
}> & { currentPromo?: Promotion | null }; // Thêm field ảo để frontend dễ dùng

// 1. Lấy danh sách Plan kèm khuyến mãi hiện hành
export async function getPlans() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { subscriptions: { where: { endDate: { gte: new Date() } } } } },
        // Lấy khuyến mãi khả dụng (Active + Còn hạn)
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          },
          orderBy: { createdAt: 'desc' },
          take: 1 // Chỉ lấy 1 cái mới nhất áp dụng
        }
      }
    });

    // Flatten dữ liệu để Frontend dễ dùng (lôi promotion[0] ra ngoài)
    const formattedPlans = plans.map(p => ({
      ...p,
      currentPromo: p.promotions[0] || null
    }));

    return { success: true, data: formattedPlans };
  } catch (error) {
    console.error("Get Plans Error:", error);
    return { success: false, data: [] };
  }
}

// 2. Tạo/Sửa thông tin cơ bản của Gói (Không đụng vào Promotion)
export async function upsertPlan(data: {
  id?: string;
  name: string;
  price: number;
  durationDays: number;
  category: PlanCategory;
  desc: string;
  isActive: boolean;
  image?: string; // 👈 Thêm trường này (Optional)
}) {
  try {
    const payload = {
      name: data.name,
      price: data.price,
      durationDays: data.durationDays,
      category: data.category,
      desc: data.desc,
      isActive: data.isActive,
      image: data.image || null, // 👈 Lưu vào DB
      unit: data.durationDays >= 30 ? '/ tháng' : '/ buổi',
    };

    if (data.id) {
      await prisma.plan.update({ where: { id: data.id }, data: payload });
    } else {
      await prisma.plan.create({ data: payload });
    }

    revalidatePath('/admin/plans');
    // Revalidate cả trang khách hàng để hiện ảnh mới ngay lập tức
    revalidatePath('/plans'); 
    return { success: true, message: "Lưu gói tập thành công!" };
  } catch (error) {
    console.error("Upsert Plan Error:", error);
    return { success: false, message: "Lỗi khi lưu gói tập." };
  }
}

// 3. 👉 API RIÊNG: Áp dụng khuyến mãi mới (Lưu lịch sử)
export async function applyPromotion(planId: string, promoData: {
  name: string;
  salePrice: number;
  startDate: Date;
  endDate: Date;
}) {
  try {
    // Bước 1: Vô hiệu hóa tất cả khuyến mãi cũ đang chạy của gói này (để tránh xung đột)
    await prisma.promotion.updateMany({
      where: { planId, isActive: true },
      data: { isActive: false }
    });

    // Bước 2: Tạo khuyến mãi mới (Lưu vào lịch sử)
    await prisma.promotion.create({
      data: {
        planId,
        name: promoData.name,
        salePrice: promoData.salePrice,
        startDate: promoData.startDate,
        endDate: promoData.endDate,
        isActive: true
      }
    });

    revalidatePath('/admin/plans');
    return { success: true, message: "Đã áp dụng khuyến mãi mới!" };
  } catch (error) {
    return { success: false, message: "Lỗi khi tạo khuyến mãi." };
  }
}

// 4. 👉 API RIÊNG: Tắt khuyến mãi (Dừng chạy sớm)
export async function stopPromotion(promoId: string) {
  try {
    await prisma.promotion.update({
      where: { id: promoId },
      data: { isActive: false }
    });
    revalidatePath('/admin/plans');
    return { success: true, message: "Đã dừng khuyến mãi." };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống." };
  }
}

// 5. Xóa gói
export async function deletePlan(id: string) {
  try {
    const activeSubs = await prisma.subscription.count({
      where: { planId: id, endDate: { gte: new Date() } }
    });

    if (activeSubs > 0) {
      return { success: false, message: `Không thể xóa! Có ${activeSubs} khách đang dùng.` };
    }

    await prisma.plan.delete({ where: { id } });
    revalidatePath('/admin/plans');
    return { success: true, message: "Đã xóa gói." };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống." };
  }
}