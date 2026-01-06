import { PrismaClient, Prisma } from '@prisma/client';
import { CreateMemberInput, UpdateMemberInput } from '@/types/admin/member';

export class MemberService {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  // 1. Lấy danh sách (Search & Pagination)
  async getAll(query: string, page: number, limit: number) {
    const where: Prisma.UserWhereInput = {
      role: 'MEMBER',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } }
      ]
    };

    const [total, data] = await this.db.$transaction([
      this.db.user.count({ where }),
      this.db.user.findMany({
        where,
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { endDate: 'desc' }
          },
          bookings: {
            include: { 
              classSession: { include: { gymClass: true, trainer: true } } 
            },
            orderBy: { bookedAt: 'desc' },
            take: 5 
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return { total, data };
  }

  // 2. Đăng ký thành viên mới (Logic phức tạp)
  async register(data: CreateMemberInput) {
    let user = await this.db.user.findUnique({ where: { email: data.email } });
    let generatedPassword = null;

    // A. Tạo User nếu chưa có
    if (!user) {
      generatedPassword = Math.random().toString(36).slice(-8) + "Aa1@";
      // Lưu ý: Thực tế nên hash password ở đây
      user = await this.db.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: 'MEMBER',
          password: generatedPassword
        }
      });
    }

    // B. Lấy gói tập & Tính giá
    const plan = await this.db.plan.findUnique({ 
        where: { id: data.planId },
        include: { promotions: true } 
    });
    if (!plan) throw new Error("Gói tập không tồn tại");

    const now = new Date();
    const activePromo = plan.promotions.find(p => p.isActive && now >= p.startDate && now <= p.endDate);
    const finalPrice = activePromo ? activePromo.salePrice : plan.price;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // C. Transaction: Tạo Sub + Invoice
    await this.db.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          userId: user!.id,
          planId: plan.id,
          startDate,
          endDate,
          isActive: true,
          autoRenew: false 
        }
      });

      await tx.invoice.create({
        data: {
          userId: user!.id,
          subscriptionId: sub.id,
          amount: finalPrice,
          status: 'PAID',     
          dueDate: new Date(), 
          paidAt: new Date()   
        }
      });
    });

    return { user, generatedPassword };
  }

  // 3. Update thông tin
  async update(id: string, data: UpdateMemberInput) {
    return await this.db.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        bio: data.bio
      }
    });
  }

  // 4. Đổi mật khẩu (Admin)
  async updatePassword(id: string, newPass: string) {
    return await this.db.user.update({
      where: { id },
      data: { password: newPass } 
    });
  }

  // 5. Xóa (Check ràng buộc)
  async delete(id: string) {
    const activeSub = await this.db.subscription.findFirst({
      where: { userId: id, isActive: true, endDate: { gte: new Date() } }
    });

    if (activeSub) throw new Error("Không thể xóa: Hội viên đang có gói tập còn hạn!");

    return await this.db.user.delete({ where: { id } });
  }
}