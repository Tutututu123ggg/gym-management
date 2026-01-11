"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MemberService } from '@/services/admin/member.service';
import { CreateMemberInput, UpdateMemberInput, MemberResponse, PaginatedMemberResult } from '@/types/admin/member';
import { protect } from '@/lib/auth-guard'; // [NEW]

const memberService = new MemberService(prisma);

// Fetch Members
export async function getMembersAction(query: string = "", page: number = 1): Promise<MemberResponse<PaginatedMemberResult>> {
  try {
    await protect(['ADMIN', 'STAFF']); // 🔒

    const limit = 10;
    const { total, data } = await memberService.getAll(query, page, limit);
    
    return { 
      success: true, 
      message: "Lấy dữ liệu thành công",
      data: {
        data,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    };
  } catch (error) {
    return { success: false, message: "Lỗi lấy danh sách hội viên." };
  }
}

// Fetch Plans (Helper for Create Modal)
export async function getPlansForDropdownAction() {
  try {
    await protect(['ADMIN', 'STAFF']); // 🔒

    const plans = await prisma.plan.findMany({
        where: { isActive: true },
        include: { promotions: true }
    });
    return { success: true, message: "OK", data: plans };
  } catch (error) {
    return { success: false, message: "Lỗi lấy danh sách gói." };
  }
}

// Register
export async function registerMemberAction(data: CreateMemberInput): Promise<MemberResponse> {
  try {
    await protect(['ADMIN', 'STAFF']); // 🔒

    const { user, generatedPassword } = await memberService.register(data);
    revalidatePath('/admin/members');
    
    if (generatedPassword) {
        return { 
            success: true, 
            message: "Đăng ký thành công!", 
            newAccount: { email: user.email, password: generatedPassword } 
        };
    }
    return { success: true, message: "Đăng ký thành công cho hội viên cũ!" };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || "Lỗi đăng ký." };
  }
}

// Update
export async function updateMemberAction(id: string, data: UpdateMemberInput): Promise<MemberResponse> {
  try {
    await protect(['ADMIN', 'STAFF']); // 🔒

    await memberService.update(id, data);
    revalidatePath('/admin/members');
    return { success: true, message: "Cập nhật thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi cập nhật." };
  }
}

// Admin Change Pass
export async function adminChangePasswordAction(id: string, newPass: string): Promise<MemberResponse> {
  if (newPass.length < 6) return { success: false, message: "Mật khẩu quá ngắn." };
  try {
    await protect(['ADMIN']); // 🔒 CHỈ ADMIN

    await memberService.updatePassword(id, newPass);
    revalidatePath('/admin/members');
    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi đổi mật khẩu." };
  }
}

// Delete
export async function deleteMemberAction(id: string): Promise<MemberResponse> {
  try {
    await protect(['ADMIN']); // 🔒 CHỈ ADMIN

    await memberService.delete(id);
    revalidatePath('/admin/members');
    return { success: true, message: "Đã xóa hội viên." };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa hội viên." };
  }
}