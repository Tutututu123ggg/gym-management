"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { EquipmentService } from '@/services/admin/equipment.service';
import { EquipmentStatus } from '@prisma/client';
import { EquipmentResponse, PaginatedResult } from '@/types/admin/equipment';

// DI: Inject Prisma vào Service
const equipmentService = new EquipmentService(prisma);

// --- FETCH ACTIONS ---

export async function getInitialData() {
  const rooms = await equipmentService.getRooms();
  return rooms;
}

export async function getEquipmentsAction(
  roomId: string = 'ALL', 
  status: EquipmentStatus | 'ALL' = 'ALL',
  searchTerm: string = '',
  page: number = 1
): Promise<PaginatedResult> {
  const limit = 10;
  try {
    const { total, data } = await equipmentService.getAll(roomId, status, searchTerm, page, limit);
    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (error) {
    console.error(error);
    return { data: [], total: 0, totalPages: 0, currentPage: 1 };
  }
}

export async function getCategoriesByRoomAction(roomId: string) {
  return await equipmentService.getCategoriesByRoom(roomId);
}

// --- MUTATION ACTIONS ---

export async function createEquipmentAction(data: any): Promise<EquipmentResponse> {
  try {
    await equipmentService.create(data);
    revalidatePath('/admin/equipment');
    return { success: true, message: "Thêm thiết bị thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống." };
  }
}

export async function updateEquipmentAction(id: string, data: any): Promise<EquipmentResponse> {
  try {
    await equipmentService.update(id, data);
    revalidatePath('/admin/equipment');
    return { success: true, message: "Cập nhật thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống." };
  }
}

export async function deleteEquipmentAction(id: string): Promise<EquipmentResponse> {
  try {
    await equipmentService.delete(id);
    revalidatePath('/admin/equipment');
    return { success: true, message: "Đã xóa thiết bị." };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống." };
  }
}

export async function createCategoryAction(roomId: string, name: string): Promise<EquipmentResponse> {
  try {
    const data = await equipmentService.createQuickCategory(roomId, name);
    return { success: true, message: "Đã thêm loại mới!", data };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi tạo loại." };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<EquipmentResponse> {
  try {
    await equipmentService.deleteQuickCategory(categoryId);
    return { success: true, message: "Đã xóa loại thiết bị." };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi xóa loại." };
  }
}