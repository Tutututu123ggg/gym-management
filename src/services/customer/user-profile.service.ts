import { PrismaClient } from '@prisma/client';
import { UpdateProfileInput } from '@/types/customer/user-profile';

export class UserProfileService {
  constructor(private db: PrismaClient) {}

  async getByEmail(email: string) {
    return await this.db.user.findUnique({
      where: { email },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, address: true, bio: true, avatar: true,
        gender: true, dateOfBirth: true, createdAt: true,
      },
    });
  }

  async update(email: string, data: UpdateProfileInput) {
    return await this.db.user.update({
      where: { email },
      data,
    });
  }
}