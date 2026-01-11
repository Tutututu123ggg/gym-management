import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Import thư viện giải mã

const PRIVATE_PATHS = {
  ADMIN: '/admin',
  STAFF: '/staff',
  COACH: '/coach',
};

enum Role {
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  STAFF = 'STAFF',
  MEMBER = 'MEMBER',
}

// Hàm verify token
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload; // Trả về { role: 'ADMIN', userId: '...', ... }
  } catch (err) {
    return null; // Token sai hoặc hết hạn
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isTryingAdmin = pathname.startsWith(PRIVATE_PATHS.ADMIN);
  const isTryingStaff = pathname.startsWith(PRIVATE_PATHS.STAFF);
  const isTryingCoach = pathname.startsWith(PRIVATE_PATHS.COACH);

  if (!isTryingAdmin && !isTryingStaff && !isTryingCoach) {
    return NextResponse.next();
  }

  // 1. Lấy token từ cookie
  const token = request.cookies.get('access_token')?.value;

  // Logic redirect về Home để bật Login Modal
  const redirectToLogin = () => {
    const url = new URL('/', request.url);
    //url.searchParams.set('openLogin', 'true');
    return NextResponse.redirect(url);
  };

  if (!token) {
    return redirectToLogin();
  }

  // 2. Verify Token (Bước quan trọng nhất - Chống F12 sửa cookie)
  const decoded = await verifyToken(token);
  
  if (!decoded) {
    // Nếu token rác hoặc hết hạn -> Xóa cookie và bắt login lại
    const response = redirectToLogin();
    response.cookies.delete('access_token');
    return response;
  }

  // 3. Lấy Role thật từ trong token đã verify
  const role = decoded.role as string;

  // --- LOGIC PHÂN QUYỀN (GIỮ NGUYÊN) ---
  if (role === Role.MEMBER) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (role === Role.STAFF && !pathname.startsWith(PRIVATE_PATHS.STAFF)) {
    return NextResponse.redirect(new URL('/staff/home', request.url));
  }

  if (role === Role.TRAINER && !pathname.startsWith(PRIVATE_PATHS.COACH)) {
    return NextResponse.redirect(new URL('/coach/', request.url));
  }

  if (role === Role.ADMIN && !pathname.startsWith(PRIVATE_PATHS.ADMIN)) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};