import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

export class BillingService {
  constructor(private db: PrismaClient) {}

  // 1. Lấy dữ liệu tổng hợp
  async getData(userId: string) {
    const [subscriptions, paymentMethods, invoices] = await Promise.all([
      this.db.subscription.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { endDate: 'desc' }
      }),
      this.db.paymentMethod.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' }
      }),
      this.db.invoice.findMany({
        where: { userId },
        include: { subscription: { include: { plan: true } } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { subscriptions, paymentMethods, invoices };
  }

  // 2. Thêm thẻ
  async addPaymentMethod(userId: string, data: { last4: string, brand: string, holder: string }) {
    // Reset default cũ nếu cần (tùy logic, ở đây giả sử cái mới auto default)
    return await this.db.paymentMethod.create({
      data: {
        userId,
        cardLast4: data.last4,
        cardBrand: data.brand,
        holderName: data.holder,
        isDefault: true 
      }
    });
  }

  // 3. Xóa thẻ
  async removePaymentMethod(userId: string, cardId: string) {
    const card = await this.db.paymentMethod.findUnique({ where: { id: cardId } });
    if (!card || card.userId !== userId) throw new Error("Không tìm thấy thẻ hoặc không có quyền xóa.");
    return await this.db.paymentMethod.delete({ where: { id: cardId } });
  }

  // 4. Đăng ký gói (Tạo Sub + Invoice Pending)
  async subscribe(userId: string, planId: string) {
    const plan = await this.db.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Gói tập không tồn tại");

    const now = new Date();

    return await this.db.$transaction(async (tx) => {
      const newSub = await tx.subscription.create({
        data: {
          userId,
          planId,
          startDate: now,
          endDate: now, // Chưa thanh toán -> chưa có hạn
          isActive: false,
          autoRenew: true,
        }
      });

      await tx.invoice.create({
        data: {
          userId,
          subscriptionId: newSub.id,
          amount: plan.price,
          status: 'PENDING',
          dueDate: addDays(now, 3),
        }
      });
      
      return newSub;
    });
  }

  // 5. Thanh toán hóa đơn (Kích hoạt gói)
  async payInvoice(userId: string, invoiceId: string, paymentMethodId: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { id: invoiceId },
      include: { subscription: { include: { plan: true } } }
    });

    if (!invoice || invoice.status === 'PAID') throw new Error('Hóa đơn không hợp lệ hoặc đã thanh toán');
    if (invoice.userId !== userId) throw new Error('Không có quyền truy cập hóa đơn này');

    // Giả lập call cổng thanh toán ở đây...
    
    // Cập nhật DB
    return await this.db.$transaction([
      this.db.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidAt: new Date() }
      }),
      this.db.subscription.update({
        where: { id: invoice.subscriptionId },
        data: { 
          isActive: true,
          // Logic: Nếu gói đang hết hạn, tính từ hôm nay. Nếu còn hạn, cộng dồn tiếp.
          endDate: addDays(
            new Date(invoice.subscription.endDate) < new Date() ? new Date() : new Date(invoice.subscription.endDate), 
            invoice.subscription.plan.durationDays
          ) 
        }
      })
    ]);
  }

  // 6. Hủy đăng ký (Gói chưa thanh toán)
  async cancelSubscription(subId: string) {
    return await this.db.$transaction(async (tx) => {
        await tx.invoice.deleteMany({ where: { subscriptionId: subId, status: 'PENDING' } });
        await tx.subscription.delete({ where: { id: subId } });
    });
  }

  // 7. Toggle Auto Renew
  async toggleAutoRenew(subId: string, currentStatus: boolean) {
    return await this.db.subscription.update({
      where: { id: subId },
      data: { autoRenew: !currentStatus }
    });
  }

  // 8. Tạo hóa đơn gia hạn thủ công
  async createRenewalInvoice(userId: string, subId: string) {
    const sub = await this.db.subscription.findUnique({ where: { id: subId }, include: { plan: true } });
    if(!sub) throw new Error("Gói không tồn tại");

    return await this.db.invoice.create({
        data: {
            userId,
            subscriptionId: subId,
            amount: sub.plan.price,
            status: 'PENDING',
            dueDate: new Date() 
        }
    });
  }
}