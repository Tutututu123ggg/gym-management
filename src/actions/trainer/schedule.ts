"use server";

import { MemberService } from "@/services/trainer/member.service";
import { revalidatePath } from "next/cache";

const memberService = new MemberService();

export async function getMemberScheduleAction(userId: string) {
  try {
    const data = await memberService.getAvailableSessions(userId);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    return { success: false, message: "Lỗi tải lịch học" };
  }
}

export async function bookClassAction(userId: string, sessionId: string) {
  try {
    await memberService.bookClass(userId, sessionId);
    revalidatePath("/member/schedule");
    return { success: true, message: "Đăng ký thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lớp đã đầy hoặc lỗi hệ thống" };
  }
}

export async function cancelBookingAction(userId: string, bookingId: string) {
  try {
    await memberService.cancelBooking(userId, bookingId);
    revalidatePath("/member/schedule");
    return { success: true, message: "Đã hủy đăng ký lớp" };
  } catch (error) {
    return { success: false, message: "Lỗi khi hủy lớp" };
  }
}