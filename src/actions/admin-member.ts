'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- 1. LẤY DANH SÁCH HỘI VIÊN (KÈM CHI TIẾT) ---
export async function getMembers(query: string = "", page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;

    // Điều kiện lọc (Dùng chung cho cả count và findMany)
    const whereCondition = {
      role: 'MEMBER' as const, // Ép kiểu const để Prisma hiểu
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } }
      ]
    };

    // Chạy song song 2 câu lệnh: Đếm tổng & Lấy dữ liệu
    const [total, members] = await prisma.$transaction([
      prisma.user.count({ where: whereCondition }),
      prisma.user.findMany({
        where: whereCondition,
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { endDate: 'desc' }
          },
          bookings: {
            include: { 
              classSession: { include: { gymClass: true, trainer: true } } 
            },
            orderBy: { bookedAt: 'desc' },
            take: 5 // Chỉ lấy 5 booking gần nhất cho nhẹ
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return { 
      success: true, 
      data: members, 
      metadata: { total, totalPages, currentPage: page, limit } 
    };

  } catch (error) {
    console.error("Error fetching members:", error);
    return { success: false, message: "Lỗi lấy danh sách" };
  }
}

// --- 2. ĐĂNG KÝ KHÁCH LẺ (GIỮ NGUYÊN LOGIC CŨ) ---
// --- 2. ĐĂNG KÝ KHÁCH LẺ (CÓ TÍNH KHUYẾN MÃI) ---
export async function registerWalkIn(data: {
  name: string;
  email: string;
  phone?: string;
  planId: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'POS'; 
}) {
  try {
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    let generatedPassword = null; // Biến để chứa mật khẩu mới (nếu có tạo)

    // A. Nếu chưa có User -> TẠO MỚI + SINH MẬT KHẨU
    if (!user) {
      // 1. Sinh mật khẩu ngẫu nhiên (8 ký tự)
      generatedPassword = Math.random().toString(36).slice(-8) + "Aa1@"; 
      
      // 2. Mã hóa mật khẩu (Nếu project bạn có dùng bcrypt)
      // const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: 'MEMBER',
          password: generatedPassword // Lưu mật khẩu (Nhớ dùng hash trong thực tế nhé!)
        }
      });
    }

    // B. Lấy thông tin gói tập
    const plan = await prisma.plan.findUnique({ 
        where: { id: data.planId },
        include: { promotions: true } 
    });
    if (!plan) return { success: false, message: "Gói tập không tồn tại" };

    // --- LOGIC TÍNH GIÁ ---
    const now = new Date();
    const activePromo = plan.promotions.find(p => p.isActive && now >= p.startDate && now <= p.endDate);
    const finalPrice = activePromo ? activePromo.salePrice : plan.price;

    // C. Tính hạn
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // D. Tạo Transaction
    await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          userId: user!.id,
          planId: plan.id,
          startDate: startDate,
          endDate: endDate,
          isActive: true,
          autoRenew: false 
        }
      });

      await tx.invoice.create({
        data: {
          userId: user!.id,
          subscriptionId: sub.id,
          amount: finalPrice,
          status: 'PAID',     
          dueDate: new Date(), 
          paidAt: new Date()   
        }
      });
    });

    revalidatePath('/admin/members');

    // --- TRẢ VỀ KẾT QUẢ ---
    // Nếu có tạo user mới, trả kèm mật khẩu để frontend hiển thị
    if (generatedPassword) {
        return { 
            success: true, 
            message: `Đăng ký thành công!`,
            newAccount: { email: data.email, password: generatedPassword } // <--- Gửi mật khẩu về
        };
    }

    return { success: true, message: "Đăng ký thành công cho hội viên cũ!" };

  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Lỗi hệ thống khi đăng ký" };
  }
}

// --- 3. CẬP NHẬT THÔNG TIN HỘI VIÊN ---
export async function updateMember(id: string, data: { name?: string; phone?: string; address?: string }) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address
      }
    });
    revalidatePath('/admin/members');
    return { success: true, message: "Cập nhật thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi khi cập nhật" };
  }
}

// --- 4. XÓA HỘI VIÊN (CÓ ĐIỀU KIỆN) ---
export async function deleteMember(id: string) {
  try {
    // Kiểm tra xem có gói tập nào đang Active (còn hạn) không
    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: id,
        isActive: true,
        endDate: { gte: new Date() } // Ngày kết thúc >= hôm nay
      }
    });

    if (activeSub) {
      return { success: false, message: "Không thể xóa: Hội viên đang có gói tập còn hạn!" };
    }

    // Nếu ok thì xóa (Lưu ý: Nếu User có ràng buộc khóa ngoại chặt chẽ, bạn có thể cần xóa Subscriptions/Invoices trước hoặc dùng onDelete: Cascade ở Schema)
    // Ở đây giả định Schema đã cấu hình Cascade hoặc chấp nhận xóa.
    await prisma.user.delete({ where: { id } });
    
    revalidatePath('/admin/members');
    return { success: true, message: "Xóa hội viên thành công!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi khi xóa (Có thể do dữ liệu ràng buộc)" };
  }
}

// --- 5. ADMIN ĐỔI MẬT KHẨU THỦ CÔNG (MANUAL UPDATE) ---
export async function adminUpdatePassword(userId: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
        return { success: false, message: "Mật khẩu phải từ 6 ký tự trở lên!" };
    }

    // Lưu ý: Thực tế bạn nên mã hóa password ở đây (vd: bcrypt.hash)
    // Ở đây mình lưu plain text theo flow hiện tại của bạn
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword } 
    });

    revalidatePath('/admin/members');
    return { success: true, message: "Đã cập nhật mật khẩu mới thành công!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi khi cập nhật mật khẩu" };
  }
}