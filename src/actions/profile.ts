/**
 * -----------------------------------------------------------------------------
 * FILE: src/actions/profile.ts
 * * CẬP NHẬT: Thêm xử lý gender và dateOfBirth
 * -----------------------------------------------------------------------------
 */

"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- 1. LẤY THÔNG TIN ---
export async function getUserProfile(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, address: true, bio: true, avatar: true,
        gender: true,       // <--- Mới
        dateOfBirth: true,  // <--- Mới
        createdAt: true,
      },
    });
    return { success: true, user };
  } catch (error) {
    return { success: false, message: "Lỗi không tìm thấy user." };
  }
}

// --- 2. CẬP NHẬT THÔNG TIN ---
export async function updateUserProfile(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const bio = formData.get('bio') as string;
  
  // Lấy dữ liệu mới
  const gender = formData.get('gender') as string;
  const dobRaw = formData.get('dateOfBirth') as string; // Dạng string "YYYY-MM-DD"

  if (!email) return { success: false, message: "Thiếu email." };

  try {
    // Chuyển đổi ngày sinh từ String sang DateTime (nếu có)
    let dateOfBirth = null;
    if (dobRaw) {
      dateOfBirth = new Date(dobRaw); 
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name, phone, address, bio,
        gender,       // <--- Lưu giới tính
        dateOfBirth,  // <--- Lưu ngày sinh (Kiểu Date)
      },
    });

    revalidatePath('/profile');
    return { success: true, message: "Cập nhật thành công!", user: updatedUser };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi server update." };
  }
}