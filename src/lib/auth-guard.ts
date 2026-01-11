// lib/auth-guard.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-mac-dinh';

export type AuthUser = {
  id: string;
  role: 'ADMIN' | 'TRAINER' | 'STAFF' | 'MEMBER';
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = cookies().get('access_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.userId as string, role: payload.role as any };
  } catch (error) { return null; }
}

// --- HÀM MỚI: DÙNG ĐỂ CHÈN VÀO GIỮA HÀM CŨ ---
export async function protect(allowedRoles: ('ADMIN' | 'TRAINER' | 'STAFF' | 'MEMBER')[] = []) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Vui lòng đăng nhập.");
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw new Error("Bạn không có quyền thực hiện thao tác này!");
  }
  return user; // Trả về user để lấy ID nếu cần
}