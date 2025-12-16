/**
 * -----------------------------------------------------------------------------
 * FILE: src/actions/auth.ts
 * * MÔ TẢ:
 * File này chứa toàn bộ logic Backend (Server Actions) để xử lý xác thực.
 * Nó đóng vai trò trung gian giữa giao diện (LoginModal) và Database (Neon).
 * * * CÁC HÀM CHÍNH:
 * 1. registerUser(formData): 
 * - Nhận email/pass -> Hash pass -> Tạo User (trạng thái chưa active).
 * - Tạo token xác thực -> Gọi hàm gửi mail.
 * 2. loginUser(formData): 
 * - Nhận email/pass -> Tìm User.
 * - [QUAN TRỌNG] Kiểm tra user.emailVerified có null không? Nếu null -> Chặn.
 * - So sánh Hash Password -> Trả về thông tin User.
 * 3. verifyEmailToken(token): (Hàm này dùng cho trang xác thực sau này).
 * * * LIÊN HỆ VỚI CÁC FILE KHÁC:
 * - Gọi DB: src/lib/prisma.ts
 * - Gọi Mail: src/lib/mail.ts
 * - Được gọi bởi: src/components/LoginModal.tsx
 * -----------------------------------------------------------------------------
 */

"use server";

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto'; // Dùng để sinh mã token ngẫu nhiên
// Import hàm gửi mail (Nếu chưa làm file mail.ts thì bạn có thể comment dòng này lại tạm)
import { sendVerificationEmail } from '@/lib/mail'; 

// --- 1. HÀM ĐĂNG KÝ (REGISTER) ---
export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string || "Hội viên mới";

  if (!email || !password) {
    return { success: false, message: "Vui lòng nhập đầy đủ Email và Mật khẩu!" };
  }

  try {
    // Check trùng email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "Email này đã được sử dụng!" };
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo mã xác thực
    const verificationToken = randomUUID();

    // Tạo user mới
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'MEMBER',
        // QUAN TRỌNG: Lưu token và để emailVerified là null (chưa kích hoạt)
        verificationToken: verificationToken, 
        emailVerified: null 
      },
    });

    // Gửi email xác thực (Nếu chưa setup Resend thì comment dòng này lại để test DB trước)
    try {
        await sendVerificationEmail(email, verificationToken);
    } catch (e) {
        console.log("Chưa setup gửi mail nên bỏ qua bước này.");
    }

    return { success: true, message: "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản." };

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return { success: false, message: "Lỗi Server, vui lòng thử lại sau." };
  }
}

// --- 2. HÀM ĐĂNG NHẬP (LOGIN) ---
export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: "Vui lòng nhập đủ thông tin!" };
  }

  try {
    // Tìm user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "Email chưa được đăng ký!" };
    }

    // =================================================================
    // [CHỐT CHẶN] KIỂM TRA ĐÃ KÍCH HOẠT CHƯA
    // =================================================================
    if (!user.emailVerified) {
      return { 
        success: false, 
        message: "Tài khoản chưa được kích hoạt! Vui lòng kiểm tra email." 
      };
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Mật khẩu không đúng!" };
    }

    return { 
      success: true, 
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return { success: false, message: "Lỗi hệ thống." };
  }
}

export async function verifyEmailToken(token: string) {
  try {
    // Tìm user có token này
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return { success: false, message: "Token không hợp lệ hoặc đã hết hạn!" };
    }

    // Update: Đã xác thực & Xóa token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Xóa token để không dùng lại được
      },
    });

    return { success: true, message: "Tài khoản của bạn đã được kích hoạt." };
  } catch (error) {
    console.error("Lỗi verify:", error);
    return { success: false, message: "Lỗi xác thực từ phía Server." };
  }
}