import { Prisma, EquipmentStatus } from '@prisma/client';

// Type cho dữ liệu hiển thị (kèm relation)
export type EquipmentWithDetails = Prisma.EquipmentGetPayload<{
  include: {
    category: {
      include: { room: true }
    }
  }
}>;

export type RoomWithCategories = Prisma.RoomGetPayload<{
  include: { categories: true }
}>;

export type SimpleCategory = { id: string; name: string };

// Type cho Input Form (Dùng chung cho Create và Update)
export interface EquipmentFormData {
  code: string;
  name: string;
  roomId: string;
  categoryId: string;
  status: EquipmentStatus;
  imagePreview: string;
  imageFile: File | null; // Chỉ dùng ở Client
  origin: string;
  description: string;
  purchaseDate: string;
  // Dành riêng cho tạo category nhanh
  newCategoryName?: string; 
}

export interface EquipmentResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResult {
  data: EquipmentWithDetails[];
  total: number;
  totalPages: number;
  currentPage: number;
}