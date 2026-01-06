import { PrismaClient, Prisma } from '@prisma/client';
import { UpsertPlanInput } from '@/types/admin/plan';

export class PlanService {
  constructor(private db: PrismaClient) {}

  // --- PLANS ---
  async getAll() {
    const plans = await this.db.plan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { subscriptions: { where: { endDate: { gte: new Date() } } } } },
        promotions: {
          where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    return plans.map(p => ({ ...p, currentPromo: p.promotions[0] || null }));
  }

  async upsert(data: UpsertPlanInput) {
    const payload = {
      name: data.name,
      price: data.price,
      durationDays: data.durationDays,
      category: data.category,
      desc: data.desc,
      isActive: data.isActive,
      image: data.image || null,
      unit: data.durationDays >= 30 ? '/ tháng' : '/ buổi',
    };
    if (data.id) return await this.db.plan.update({ where: { id: data.id }, data: payload });
    return await this.db.plan.create({ data: payload });
  }

  async delete(id: string) {
    const activeSubs = await this.db.subscription.count({ where: { planId: id, endDate: { gte: new Date() } } });
    if (activeSubs > 0) throw new Error(`Không thể xóa! Có ${activeSubs} khách đang dùng.`);
    return await this.db.plan.delete({ where: { id } });
  }

  // --- PROMOTIONS ---
  async applyPromo(planId: string, data: { name: string; salePrice: number; startDate: Date; endDate: Date }) {
    // Tắt promo cũ
    await this.db.promotion.updateMany({ where: { planId, isActive: true }, data: { isActive: false } });
    // Tạo mới
    return await this.db.promotion.create({ data: { ...data, planId, isActive: true } });
  }

  async stopPromo(id: string) {
    return await this.db.promotion.update({ where: { id }, data: { isActive: false } });
  }

  // --- GYM CLASSES ---
  async getClassesByPlan(planId: string) {
    return await this.db.gymClass.findMany({
      where: { planId },
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createClass(planId: string, name: string) {
    return await this.db.gymClass.create({ data: { planId, name, isActive: true } });
  }

  async deleteClass(id: string) {
    const futureSessions = await this.db.classSession.count({ where: { gymClassId: id, startTime: { gte: new Date() }, isCanceled: false } });
    if (futureSessions > 0) throw new Error(`Còn ${futureSessions} buổi học sắp tới. Không thể xóa.`);
    return await this.db.gymClass.delete({ where: { id } });
  }
}