/**
 * -----------------------------------------------------------------------------
 * FILE: prisma/seed.ts
 * * MÔ TẢ:
 * File này dùng để "gieo" (seed) dữ liệu mẫu vào Database.
 * Thường dùng để tạo tài khoản Admin mặc định hoặc dữ liệu test ban đầu
 * mà không cần đăng ký thủ công qua giao diện.
 * * * CÁC THAO TÁC:
 * 1. Xóa dữ liệu cũ (tùy chọn).
 * 2. Hash mật khẩu "123456".
 * 3. Tạo user mới với emailVerified = now() (tức là đã xác thực rồi).
 * * * CÁCH CHẠY:
 * Chạy lệnh: npx prisma db seed
 * -----------------------------------------------------------------------------
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo dữ liệu mẫu (Seeding)...');

  // 1. Tạo mật khẩu đã mã hóa (Hash)
  // Mật khẩu test sẽ là: 123456
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 2. Tạo tài khoản Test
  const user = await prisma.user.upsert({
    where: { email: 'test@gymmaster.vn' }, // Kiểm tra nếu email này có rồi thì thôi
    update: {}, // Nếu có rồi thì không làm gì cả
    create: {
      email: 'test@gymmaster.vn',
      name: 'Hội Viên Test',
      password: hashedPassword,
      role: 'MEMBER', // Hoặc đổi thành 'ADMIN' nếu muốn test quyền admin
      emailVerified: new Date(), // QUAN TRỌNG: Đánh dấu là đã xác thực luôn
    },
  });

  console.log(`✅ Đã tạo user test: ${user.email} | Pass: 123456`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });