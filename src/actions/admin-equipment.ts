"use server";

import prisma from '@/lib/prisma';
import { EquipmentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// --- TYPES ---

export type EquipmentWithDetails = Prisma.EquipmentGetPayload<{
  include: {
    category: {
      include: {
        room: true
      }
    }
  }
}>;

export type RoomWithCategories = Prisma.RoomGetPayload<{
  include: {
    categories: true
  }
}>;

// Định nghĩa kiểu trả về mới cho hàm có phân trang
export type PaginatedResult = {
  data: EquipmentWithDetails[];
  total: number;
  totalPages: number;
  currentPage: number;
};

// --- ACTIONS ---

// 1. Lấy danh sách phòng
export async function getRooms(): Promise<RoomWithCategories[]> {
  return await prisma.room.findMany({
    include: { categories: true }
  });
}

// 2. Lấy danh sách thiết bị (có lọc)
export async function getEquipments(
  roomId?: string, 
  status?: EquipmentStatus | 'ALL',
  page: number = 1,    // Trang hiện tại
  limit: number = 10   // Số dòng mỗi trang
): Promise<PaginatedResult> {
  try {
    const whereCondition: Prisma.EquipmentWhereInput = {};

    if (roomId && roomId !== 'ALL') {
      whereCondition.category = { roomId: roomId };
    }

    if (status && status !== 'ALL') {
      whereCondition.status = status;
    }

    // Dùng $transaction để chạy song song 2 lệnh: đếm tổng và lấy dữ liệu
    const [total, equipments] = await prisma.$transaction([
      prisma.equipment.count({ where: whereCondition }),
      prisma.equipment.findMany({
        where: whereCondition,
        include: {
          category: {
            include: { room: true }
          }
        },
        orderBy: { code: 'asc' }, // Sắp xếp
        skip: (page - 1) * limit, // Bỏ qua x dòng
        take: limit               // Lấy y dòng
      })
    ]);

    return {
      data: equipments,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };

  } catch (error) {
    console.error("Lỗi lấy danh sách thiết bị:", error);
    return { data: [], total: 0, totalPages: 0, currentPage: 1 };
  }
}

// 3. Cập nhật trạng thái thiết bị (Giữ lại để tương thích cũ nếu cần)
export async function updateEquipmentStatus(
  id: string, 
  status: EquipmentStatus
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.equipment.update({
      where: { id },
      data: {
        status,
        lastMaintained: status === 'MAINTENANCE' ? new Date() : undefined, 
      }
    });
    
    revalidatePath('/admin/equipment');
    return { success: true, message: "Cập nhật trạng thái thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống khi cập nhật." };
  }
}

// 👉 [MỚI] 3.1. Cập nhật ĐẦY ĐỦ thông tin thiết bị
export async function updateEquipment(id: string, data: {
  code: string;
  name: string;
  roomId: string;
  categoryId: string;
  status: EquipmentStatus;
  image?: string;
  origin?: string;
  description?: string;
  purchaseDate?: Date;
}) {
  try {
    // (Optional: Có thể check trùng code nếu cần)

    await prisma.equipment.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        categoryId: data.categoryId,
        status: data.status,
        image: data.image, // Frontend gửi link ảnh cũ hoặc mới
        
        // Cập nhật các trường optional
        origin: data.origin || null,
        description: data.description || null,
        purchaseDate: data.purchaseDate || null,

        // Nếu chuyển sang bảo trì thì update ngày
        lastMaintained: data.status === 'MAINTENANCE' ? new Date() : undefined,
      }
    });

    revalidatePath('/admin/equipment');
    return { success: true, message: "Cập nhật thông tin thành công!" };
  } catch (error) {
    console.error("Lỗi Update Full:", error);
    return { success: false, message: "Lỗi hệ thống khi cập nhật thông tin." };
  }
}

// 4. Xóa thiết bị (Chỉ xóa khi BROKEN)
export async function deleteEquipment(id: string) {
  try {
    const item = await prisma.equipment.findUnique({ where: { id } });

    if (!item) return { success: false, message: "Thiết bị không tồn tại." };

    if (item.status !== 'BROKEN') {
      return { 
        success: false, 
        message: "Chỉ được xóa các thiết bị có trạng thái 'Hỏng / Ngưng sử dụng'." 
      };
    }

    await prisma.equipment.delete({ where: { id } });

    revalidatePath('/admin/equipment');
    return { success: true, message: "Đã xóa thiết bị thành công." };
  } catch (error) {
    console.error("Lỗi Delete:", error);
    return { success: false, message: "Không thể xóa (Lỗi hệ thống)." };
  }
}

// 5. Lấy danh sách loại theo phòng
export async function getCategoriesByRoom(roomId: string) {
  return await prisma.equipmentCategory.findMany({
    where: { roomId }
  });
}

// 6. Tạo thiết bị mới (Đã sửa cho phép null các trường optional)
export async function createEquipment(data: {
  code: string;
  name: string;
  roomId: string;
  categoryId: string;
  newCategoryName?: string;
  status: EquipmentStatus;
  image?: string;
  description?: string;
  origin?: string;
  purchaseDate?: Date;
}) {
  try {
    // Check trùng mã
    const existing = await prisma.equipment.findFirst({ where: { code: data.code } });
    if (existing) return { success: false, message: "Mã thiết bị (Code) đã tồn tại!" };

    let finalCategoryId = data.categoryId;

    // Xử lý tạo loại mới nhanh
    if (data.categoryId === 'NEW') {
      if (!data.newCategoryName) return { success: false, message: "Vui lòng nhập tên loại mới!" };
      const newCat = await prisma.equipmentCategory.create({
        data: { name: data.newCategoryName, roomId: data.roomId }
      });
      finalCategoryId = newCat.id;
    }

    await prisma.equipment.create({
      data: {
        code: data.code,
        name: data.name,
        categoryId: finalCategoryId,
        status: data.status,
        image: data.image || null,
        lastMaintained: new Date(),
        
        // 👇 Cho phép null nếu không nhập
        description: data.description || null,
        origin: data.origin || null,
        purchaseDate: data.purchaseDate || null 
      }
    });

    revalidatePath('/admin/equipment');
    return { success: true, message: "Thêm thiết bị thành công!" };
  } catch (error) {
    console.error("Lỗi tạo thiết bị:", error);
    return { success: false, message: "Lỗi hệ thống." };
  }
}

// 7. Tạo nhanh Category
export async function createQuickCategory(roomId: string, name: string) {
  try {
    const newCat = await prisma.equipmentCategory.create({
      data: { name, roomId }
    });
    return { success: true, data: newCat, message: "Đã thêm loại mới!" };
  } catch (error) {
    return { success: false, message: "Lỗi khi tạo loại thiết bị." };
  }
}

// 8. Xóa nhanh Category
export async function deleteQuickCategory(categoryId: string) {
  try {
    const count = await prisma.equipment.count({ where: { categoryId } });
    if (count > 0) return { success: false, message: `Không thể xóa! Đang có ${count} thiết bị thuộc loại này.` };

    await prisma.equipmentCategory.delete({ where: { id: categoryId } });
    return { success: true, message: "Đã xóa loại thiết bị." };
  } catch (error) {
    return { success: false, message: "Lỗi khi xóa loại thiết bị." };
  }
}