import { PrismaClient, Prisma, EquipmentStatus } from '@prisma/client';

export class EquipmentService {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  // Lấy danh sách phòng & categories
  async getRooms() {
    return await this.db.room.findMany({
      include: { categories: true }
    });
  }

  // Lấy danh sách Categories theo Room
  async getCategoriesByRoom(roomId: string) {
    return await this.db.equipmentCategory.findMany({ where: { roomId } });
  }

  // Lấy danh sách thiết bị (Phân trang & Lọc)
  async getAll(
    roomId: string,
    status: EquipmentStatus | 'ALL',
    searchTerm: string,
    page: number,
    limit: number
  ) {
    const where: Prisma.EquipmentWhereInput = {};

    if (roomId && roomId !== 'ALL') where.category = { roomId };
    if (status && status !== 'ALL') where.status = status;
    
    // Tìm kiếm theo tên hoặc code
    if (searchTerm) {
      where.OR = [
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const [total, data] = await this.db.$transaction([
      this.db.equipment.count({ where }),
      this.db.equipment.findMany({
        where,
        include: {
          category: { include: { room: true } }
        },
        orderBy: { code: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return { total, data };
  }

  // Tạo mới (Xử lý cả logic tạo category nhanh)
  async create(data: any) {
    // Check trùng mã
    const existing = await this.db.equipment.findFirst({ where: { code: data.code } });
    if (existing) throw new Error("Mã thiết bị (Code) đã tồn tại!");

    let finalCategoryId = data.categoryId;

    // Logic tạo category nhanh
    if (data.categoryId === 'NEW' && data.newCategoryName) {
      const newCat = await this.db.equipmentCategory.create({
        data: { name: data.newCategoryName, roomId: data.roomId }
      });
      finalCategoryId = newCat.id;
    }

    return await this.db.equipment.create({
      data: {
        code: data.code,
        name: data.name,
        categoryId: finalCategoryId,
        status: data.status,
        image: data.image || null,
        lastMaintained: new Date(),
        description: data.description || null,
        origin: data.origin || null,
        purchaseDate: data.purchaseDate || null
      }
    });
  }

  // Cập nhật
  async update(id: string, data: any) {
    return await this.db.equipment.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        categoryId: data.categoryId,
        status: data.status,
        image: data.image,
        origin: data.origin || null,
        description: data.description || null,
        purchaseDate: data.purchaseDate || null,
        lastMaintained: data.status === 'MAINTENANCE' ? new Date() : undefined,
      }
    });
  }

  // Xóa
  async delete(id: string) {
    const item = await this.db.equipment.findUnique({ where: { id } });
    if (!item) throw new Error("Thiết bị không tồn tại.");
    if (item.status !== 'BROKEN') throw new Error("Chỉ được xóa thiết bị trạng thái 'Hỏng'.");
    
    return await this.db.equipment.delete({ where: { id } });
  }

  // Category Actions
  async createQuickCategory(roomId: string, name: string) {
    return await this.db.equipmentCategory.create({ data: { name, roomId } });
  }

  async deleteQuickCategory(categoryId: string) {
    const count = await this.db.equipment.count({ where: { categoryId } });
    if (count > 0) throw new Error(`Không thể xóa! Có ${count} thiết bị đang dùng loại này.`);
    return await this.db.equipmentCategory.delete({ where: { id: categoryId } });
  }
}