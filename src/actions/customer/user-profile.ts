"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserProfileService } from '@/services/customer/user-profile.service';
import { UpdateProfileInput } from '@/types/customer/user-profile';

// Khởi tạo Service
const profileService = new UserProfileService(prisma);

// --- 1. LẤY THÔNG TIN ---
export async function getUserProfileAction(email: string) {
  try {
    const user = await profileService.getByEmail(email);
    if (!user) return { success: false, message: "Người dùng không tồn tại." };
    // Prisma trả về Date object, Next.js Server Action cần serialize JSON nên có thể cần chuyển đổi ở Client
    return { success: true, user: user as any }; 
  } catch (error) {
    return { success: false, message: "Lỗi lấy thông tin người dùng." };
  }
}

// --- 2. CẬP NHẬT ---
export async function updateUserProfileAction(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { success: false, message: "Thiếu email xác thực." };

  const dobRaw = formData.get('dateOfBirth') as string;
  
  // Chuẩn bị dữ liệu update
  const updateData: UpdateProfileInput = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
    bio: formData.get('bio') as string,
    gender: formData.get('gender') as string,
    dateOfBirth: dobRaw ? new Date(dobRaw) : null,
  };

  try {
    const updatedUser = await profileService.update(email, updateData);
    revalidatePath('/profile');
    return { success: true, message: "Cập nhật hồ sơ thành công!", user: updatedUser as any };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi hệ thống khi cập nhật." };
  }
}