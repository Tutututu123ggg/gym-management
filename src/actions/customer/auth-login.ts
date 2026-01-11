"use server";

import prisma from '@/lib/prisma';
import { AuthService } from '@/services/customer/auth.service';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

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

async function signToken(payload: any) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Token sống 1 ngày
    .sign(secret);
}

export async function loginUserAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { success: false, message: "Thiếu thông tin!" };

  try {
    const user = await authService.login({ email, password });
    
    // 1. Tạo JWT chứa Role và ID
    const token = await signToken({ 
      role: user.role, 
      userId: user.id 
    });

    // 2. Lưu JWT vào Cookie (HttpOnly) -> User không sửa được cái này
    cookies().set('access_token', token, { 
      httpOnly: true, 
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400 // 1 ngày
    });
    
    // Xóa cookie user_role cũ đi cho an toàn (nếu có)
    cookies().delete('user_role');

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