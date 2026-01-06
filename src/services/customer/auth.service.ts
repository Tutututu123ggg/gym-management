import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '@/lib/mail'; // Giả sử bạn đã có file này

export class AuthService {
  constructor(private db: PrismaClient) {}

  // --- 1. ĐĂNG KÝ ---
  async register(data: { email: string; password: string; name: string }) {
    // Check trùng email
    const existingUser = await this.db.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error("Email này đã được sử dụng!");
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = randomUUID();

    // Tạo user
    await this.db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'MEMBER',
        verificationToken,
        emailVerified: null // Chưa active
      },
    });

    // Gửi mail (bọc try-catch để không chặn flow nếu lỗi mail)
    try {
      await sendVerificationEmail(data.email, verificationToken);
    } catch (e) {
      console.warn("Gửi email thất bại:", e);
    }

    return true;
  }

  // --- 2. ĐĂNG NHẬP ---
  async login(data: { email: string; password: string }) {
    const user = await this.db.user.findUnique({ where: { email: data.email } });

    if (!user) throw new Error("Email chưa được đăng ký!");
    
    // Check Active
    if (!user.emailVerified) {
      throw new Error("Tài khoản chưa được kích hoạt! Vui lòng kiểm tra email.");
    }

    // Check Pass
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error("Mật khẩu không đúng!");

    // Trả về user info (để lưu vào Context/Session)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  // --- 3. VERIFY EMAIL (Giữ nguyên từ trước) ---
  async verifyEmail(token: string) {
    const user = await this.db.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new Error("Token không hợp lệ hoặc đã hết hạn!");

    await this.db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), verificationToken: null },
    });
    return true;
  }
}