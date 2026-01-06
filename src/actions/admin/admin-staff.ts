"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { StaffService } from '@/services/admin/staff.service';
import { UpsertKPIParams, StaffActionResult } from '@/types/admin/staff';

const staffService = new StaffService(prisma);

export async function getStaffKPIsAction(month: Date): Promise<StaffActionResult> {
  try {
    const data = await staffService.getStaffKPIs(month);
    return { success: true, data };
  } catch (error) {
    console.error("Get Staff KPI Error:", error);
    return { success: false, message: "Lỗi lấy dữ liệu nhân sự" };
  }
}

export async function upsertKPIAction(data: UpsertKPIParams): Promise<{ success: boolean; message: string }> {
  try {
    await staffService.upsertKPI(data);
    revalidatePath('/admin/staff');
    return { success: true, message: "Đã lưu KPI & Thưởng thành công!" };
  } catch (error) {
    console.error("Upsert KPI Error:", error);
    return { success: false, message: "Lỗi khi lưu KPI" };
  }
}