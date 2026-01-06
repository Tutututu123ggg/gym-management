"use server";

import prisma from '@/lib/prisma';
import { AuthService } from '@/services/customer/auth.service';

const authService = new AuthService(prisma);

// --- REGISTER ACTION ---
export async function registerUserAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string || "Hội viên mới";

  if (!email || !password) return { success: false, message: "Thiếu thông tin!" };

  try {
    await authService.register({ email, password, name });
    return { success: true, message: "Đăng ký thành công! Vui lòng kiểm tra email." };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi đăng ký." };
  }
}

// --- LOGIN ACTION ---
export async function loginUserAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { success: false, message: "Thiếu thông tin!" };

  try {
    const user = await authService.login({ email, password });
    return { success: true, message: "Đăng nhập thành công!", user };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi đăng nhập." };
  }
}

// --- VERIFY ACTION (Giữ nguyên) ---
export async function verifyEmailTokenAction(token: string) {
  try {
    await authService.verifyEmail(token);
    return { success: true, message: "Kích hoạt tài khoản thành công." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}