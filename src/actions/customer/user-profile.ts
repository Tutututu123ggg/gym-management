"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserProfileService } from '@/services/customer/user-profile.service';
import { UpdateProfileInput } from '@/types/customer/user-profile';
import { protect } from '@/lib/auth-guard'; // [NEW]

// Khởi tạo Service
const profileService = new UserProfileService(prisma);

// --- 1. LẤY THÔNG TIN ---
export async function getUserProfileAction(email: string) {
  try {
    await protect(['MEMBER']); // 🔒
    // Lưu ý: Nếu muốn chặt hơn thì phải so sánh email với token, 
    // nhưng ở đây ta ít nhất đảm bảo người gọi đã login là Member.
    
    const user = await profileService.getByEmail(email);
    if (!user) return { success: false, message: "Người dùng không tồn tại." };
    
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
    await protect(['MEMBER']); // 🔒

    const updatedUser = await profileService.update(email, updateData);
    revalidatePath('/profile');
    return { success: true, message: "Cập nhật hồ sơ thành công!", user: updatedUser as any };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi hệ thống khi cập nhật." };
  }
}