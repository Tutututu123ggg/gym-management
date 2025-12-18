'use server'

import { revalidatePath } from 'next/cache'
import { addDays } from 'date-fns'
import prisma  from '@/lib/prisma'


// 1. Lấy dữ liệu trang Billing (GIỮ NGUYÊN)
export async function getBillingData(userId: string) {
  const [subscriptions, paymentMethods, invoices] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { endDate: 'desc' }
    }),
    prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    }),
    prisma.invoice.findMany({
      where: { userId },
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { subscriptions, paymentMethods, invoices };
}

// 2. Thêm thẻ mới (GIỮ NGUYÊN)
export async function addPaymentMethod(userId: string, cardData: { last4: string, brand: string, holder: string }) {
  await prisma.paymentMethod.create({
    data: {
      userId,
      cardLast4: cardData.last4,
      cardBrand: cardData.brand,
      holderName: cardData.holder,
      isDefault: true 
    }
  });
  revalidatePath('/billing');
}

// 3. Thanh toán Hóa đơn / Gia hạn (GIỮ NGUYÊN)
export async function payInvoice(userId: string, invoiceId: string, paymentMethodId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { subscription: { include: { plan: true } } }
  });

  if (!invoice || invoice.status === 'PAID') return { success: false, message: 'Hóa đơn không hợp lệ' };

  // Giả lập thanh toán thành công...

  await prisma.$transaction([
    // Cập nhật hóa đơn
    prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paidAt: new Date() }
    }),
    // Cập nhật gói tập: Kích hoạt + Cộng thêm ngày vào EndDate hiện tại
    prisma.subscription.update({
      where: { id: invoice.subscriptionId },
      data: { 
        isActive: true,
        // Logic: Lấy ngày hết hạn hiện tại + thêm số ngày của gói
        endDate: addDays(new Date(invoice.subscription.endDate), invoice.subscription.plan.durationDays) 
      }
    })
  ]);

  revalidatePath('/billing');
  return { success: true, message: 'Thanh toán thành công! Gói tập đã được kích hoạt.' };
}

// 4. Hủy gia hạn (GIỮ NGUYÊN)
export async function toggleAutoRenew(subscriptionId: string, currentStatus: boolean) {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { autoRenew: !currentStatus }
  });
  revalidatePath('/billing');
}

// 5. Tạo hóa đơn gia hạn thủ công (GIỮ NGUYÊN)
export async function createRenewalInvoice(userId: string, subscriptionId: string) {
    const sub = await prisma.subscription.findUnique({ 
        where: { id: subscriptionId }, 
        include: { plan: true } 
    });
    
    if(!sub) return;

    await prisma.invoice.create({
        data: {
            userId,
            subscriptionId,
            amount: sub.plan.price,
            status: 'PENDING',
            dueDate: new Date() 
        }
    });
    revalidatePath('/billing');
}

// ==========================================
// 👇 6. HÀM MỚI THÊM: ĐĂNG KÝ GÓI TẬP 👇
// ==========================================
export async function subscribeToPlan(userId: string, planId: string) {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Gói tập không tồn tại");

    // Logic ngày tháng:
    // Khi mới đăng ký, EndDate = StartDate (tức là chưa có ngày tập nào).
    // Khi user thanh toán hóa đơn đầu tiên (hàm payInvoice ở trên), nó sẽ cộng thêm DurationDays vào EndDate.
    // Như vậy user phải trả tiền thì mới có ngày tập.
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Tạo Subscription (Chưa kích hoạt)
      const newSub = await tx.subscription.create({
        data: {
          userId,
          planId,
          startDate: now,
          endDate: now, // Hết hạn ngay lập tức vì chưa trả tiền
          isActive: false, // Chưa kích hoạt
          autoRenew: true,
        }
      });

      // 2. Tạo Hóa đơn đầu tiên (PENDING)
      await tx.invoice.create({
        data: {
          userId,
          subscriptionId: newSub.id,
          amount: plan.price,
          status: 'PENDING',
          dueDate: addDays(now, 3), // Hạn trả tiền là 3 ngày sau
        }
      });
    });

    revalidatePath('/billing');
    return { success: true, message: "Đăng ký thành công! Vui lòng thanh toán để kích hoạt." };

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return { success: false, message: "Đăng ký thất bại. Vui lòng thử lại." };
  }
}

// 6. Hủy gói đăng ký (Dành cho gói chưa thanh toán)
export async function cancelSubscription(subscriptionId: string) {
  try {
    // Xóa subscription (Prisma sẽ tự cascade xóa Invoice liên quan nếu bạn cấu hình relation onDelete: Cascade)
    // Hoặc xóa thủ công cả 2
    await prisma.$transaction(async (tx) => {
        // Tìm các invoice pending của sub này và xóa trước (nếu không có cascade)
        await tx.invoice.deleteMany({
            where: { subscriptionId, status: 'PENDING' }
        });
        
        // Xóa subscription
        await tx.subscription.delete({
            where: { id: subscriptionId }
        });
    });

    revalidatePath('/billing');
    return { success: true, message: "Đã hủy gói đăng ký thành công." };
  } catch (error) {
    console.error("Lỗi hủy gói:", error);
    return { success: false, message: "Không thể hủy gói. Vui lòng thử lại." };
  }
}

// 7. Xóa phương thức thanh toán (Thẻ)
export async function removePaymentMethod(userId: string, paymentMethodId: string) {
  try {
    // Kiểm tra quyền sở hữu (Security Check)
    const card = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId }
    });

    if (!card || card.userId !== userId) {
        return { success: false, message: "Không tìm thấy thẻ hoặc bạn không có quyền xóa." };
    }

    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId }
    });

    revalidatePath('/billing');
    return { success: true, message: "Đã xóa thẻ thành công." };
  } catch (error) {
    console.error("Lỗi xóa thẻ:", error);
    return { success: false, message: "Lỗi hệ thống. Không thể xóa thẻ." };
  }
}