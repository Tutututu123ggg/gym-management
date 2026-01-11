"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BillingService } from '@/services/customer/billing.service';
import { protect } from '@/lib/auth-guard'; // [NEW]

// Khởi tạo Service
const billingService = new BillingService(prisma);

// --- QUERY ACTIONS ---

export async function getBillingData(userId: string) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) throw new Error("Không có quyền truy cập dữ liệu này");

    return await billingService.getData(userId);
  } catch (error) {
    console.error(error);
    return { subscriptions: [], paymentMethods: [], invoices: [] };
  }
}

// --- MUTATION ACTIONS ---

export async function addPaymentMethod(userId: string, cardData: { last4: string, brand: string, holder: string }) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Không có quyền" };

    await billingService.addPaymentMethod(userId, cardData);
    revalidatePath('/billing');
    return { success: true, message: "Thêm thẻ thành công" };
  } catch (error) {
    return { success: false, message: "Lỗi thêm thẻ" };
  }
}

export async function removePaymentMethod(userId: string, cardId: string) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Không có quyền" };

    await billingService.removePaymentMethod(userId, cardId);
    revalidatePath('/billing');
    return { success: true, message: "Đã xóa thẻ" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa thẻ" };
  }
}

export async function subscribeToPlan(userId: string, planId: string) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Không có quyền" };

    await billingService.subscribe(userId, planId);
    revalidatePath('/billing');
    return { success: true, message: "Đăng ký thành công! Vui lòng thanh toán." };
  } catch (error: any) {
    return { success: false, message: error.message || "Đăng ký thất bại" };
  }
}

export async function payInvoice(userId: string, invoiceId: string, paymentMethodId: string) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Không có quyền" };

    await billingService.payInvoice(userId, invoiceId, paymentMethodId);
    revalidatePath('/billing');
    return { success: true, message: "Thanh toán thành công! Gói tập đã kích hoạt." };
  } catch (error: any) {
    return { success: false, message: error.message || "Thanh toán thất bại" };
  }
}

export async function cancelSubscription(subId: string) {
  try {
    await protect(['MEMBER']); // 🔒 (Logic hủy cần check owner trong service hoặc ở đây nếu có userId)
    // Giả sử service đã check subId thuộc về user gọi hàm
    await billingService.cancelSubscription(subId);
    revalidatePath('/billing');
    return { success: true, message: "Đã hủy gói đăng ký." };
  } catch (error) {
    return { success: false, message: "Lỗi hủy gói." };
  }
}

export async function toggleAutoRenew(subId: string, currentStatus: boolean) {
  try {
    await protect(['MEMBER']); // 🔒
    await billingService.toggleAutoRenew(subId, currentStatus);
    revalidatePath('/billing');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function createRenewalInvoice(userId: string, subId: string) {
  try {
    const user = await protect(['MEMBER']); // 🔒
    if (user.id !== userId) return { success: false, message: "Không có quyền" };

    await billingService.createRenewalInvoice(userId, subId);
    revalidatePath('/billing');
    return { success: true, message: "Đã tạo hóa đơn gia hạn." };
  } catch (error) {
    return { success: false, message: "Lỗi tạo hóa đơn." };
  }
}