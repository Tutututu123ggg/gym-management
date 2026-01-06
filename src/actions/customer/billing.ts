"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BillingService } from '@/services/customer/billing.service';

// Khởi tạo Service
const billingService = new BillingService(prisma);

// --- QUERY ACTIONS ---

export async function getBillingData(userId: string) {
  try {
    return await billingService.getData(userId);
  } catch (error) {
    console.error(error);
    return { subscriptions: [], paymentMethods: [], invoices: [] };
  }
}

// --- MUTATION ACTIONS ---

export async function addPaymentMethod(userId: string, cardData: { last4: string, brand: string, holder: string }) {
  try {
    await billingService.addPaymentMethod(userId, cardData);
    revalidatePath('/billing');
    return { success: true, message: "Thêm thẻ thành công" };
  } catch (error) {
    return { success: false, message: "Lỗi thêm thẻ" };
  }
}

export async function removePaymentMethod(userId: string, cardId: string) {
  try {
    await billingService.removePaymentMethod(userId, cardId);
    revalidatePath('/billing');
    return { success: true, message: "Đã xóa thẻ" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa thẻ" };
  }
}

export async function subscribeToPlan(userId: string, planId: string) {
  try {
    await billingService.subscribe(userId, planId);
    revalidatePath('/billing');
    return { success: true, message: "Đăng ký thành công! Vui lòng thanh toán." };
  } catch (error: any) {
    return { success: false, message: error.message || "Đăng ký thất bại" };
  }
}

export async function payInvoice(userId: string, invoiceId: string, paymentMethodId: string) {
  try {
    await billingService.payInvoice(userId, invoiceId, paymentMethodId);
    revalidatePath('/billing');
    return { success: true, message: "Thanh toán thành công! Gói tập đã kích hoạt." };
  } catch (error: any) {
    return { success: false, message: error.message || "Thanh toán thất bại" };
  }
}

export async function cancelSubscription(subId: string) {
  try {
    await billingService.cancelSubscription(subId);
    revalidatePath('/billing');
    return { success: true, message: "Đã hủy gói đăng ký." };
  } catch (error) {
    return { success: false, message: "Lỗi hủy gói." };
  }
}

export async function toggleAutoRenew(subId: string, currentStatus: boolean) {
  try {
    await billingService.toggleAutoRenew(subId, currentStatus);
    revalidatePath('/billing');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function createRenewalInvoice(userId: string, subId: string) {
  try {
    await billingService.createRenewalInvoice(userId, subId);
    revalidatePath('/billing');
    return { success: true, message: "Đã tạo hóa đơn gia hạn." };
  } catch (error) {
    return { success: false, message: "Lỗi tạo hóa đơn." };
  }
}