"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PlanService } from '@/services/admin/plan.service';
import { ScheduleService } from '@/services/admin/schedule.service';
import { UpsertPlanInput, CreateScheduleInput } from '@/types/admin/plan';

const planService = new PlanService(prisma);
const scheduleService = new ScheduleService(prisma);

// --- PLAN ACTIONS ---
export async function getPlansAction() {
  try {
    const data = await planService.getAll();
    return { success: true, data };
  } catch (e) { return { success: false, data: [] }; }
}

export async function upsertPlanAction(data: UpsertPlanInput) {
  try {
    await planService.upsert(data);
    revalidatePath('/admin/plans');
    revalidatePath('/plans'); 
    return { success: true, message: "Lưu thành công!" };
  } catch (e) { return { success: false, message: "Lỗi lưu gói tập." }; }
}

export async function deletePlanAction(id: string) {
  try {
    await planService.delete(id);
    revalidatePath('/admin/plans');
    return { success: true, message: "Đã xóa." };
  } catch (e: any) { return { success: false, message: e.message || "Lỗi xóa." }; }
}

// --- PROMO ACTIONS ---
export async function applyPromoAction(planId: string, data: any) {
  try {
    await planService.applyPromo(planId, data);
    revalidatePath('/admin/plans');
    return { success: true, message: "Đã áp dụng KM." };
  } catch (e) { return { success: false, message: "Lỗi tạo KM." }; }
}

export async function stopPromoAction(id: string) {
  try {
    await planService.stopPromo(id);
    revalidatePath('/admin/plans');
    return { success: true, message: "Đã dừng KM." };
  } catch (e) { return { success: false, message: "Lỗi dừng KM." }; }
}

// --- CLASS & SCHEDULE ACTIONS ---
export async function getClassesAction(planId: string) {
  try {
    const data = await planService.getClassesByPlan(planId);
    return { success: true, data };
  } catch (e) { return { success: false, data: [] }; }
}

export async function createClassAction(planId: string, name: string) {
  try {
    await planService.createClass(planId, name);
    return { success: true, message: "Tạo lớp thành công." };
  } catch (e) { return { success: false, message: "Lỗi tạo lớp." }; }
}

export async function deleteClassAction(id: string) {
  try {
    await planService.deleteClass(id);
    return { success: true, message: "Xóa lớp thành công." };
  } catch (e: any) { return { success: false, message: e.message }; }
}

export async function getScheduleResourcesAction() {
  try {
    const data = await scheduleService.getResources();
    return { success: true, ...data };
  } catch (e) { return { success: false, trainers: [], rooms: [] }; }
}

export async function getSessionsAction(from: Date, to: Date, classId?: string) {
  try {
    const sessions = await scheduleService.getSessions(from, to, classId);
    // Map data về format Calendar
    const events = sessions.map(s => ({
      id: s.id,
      title: `${s.gymClass.name} (${s.trainer?.name || 'No Trainer'})`,
      start: s.startTime,
      end: s.endTime,
      resource: {
        room: s.room?.name || '',
        capacity: s.maxCapacity,
        booked: s._count.bookings
      }
    }));
    return { success: true, data: events };
  } catch (e) { return { success: false, data: [] }; }
}

export async function createScheduleAction(data: CreateScheduleInput) {
  try {
    const count = await scheduleService.createBulk(data);
    return { success: true, message: `Đã tạo ${count} buổi học!` };
  } catch (e) { return { success: false, message: "Lỗi tạo lịch." }; }
}