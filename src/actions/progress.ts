'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { differenceInCalendarDays, subDays } from 'date-fns' // Cần import subDays

const prisma = new PrismaClient()

// --- CHECK IN / CHECK OUT LOGIC ---
export async function toggleCheckIn(userId: string) {
  // 1. Kiểm tra session đang mở (Chưa check-out)
  const activeSession = await prisma.checkIn.findFirst({
    where: { userId, checkOutAt: null },
    orderBy: { checkInAt: 'desc' }
  });

  // --- TRƯỜNG HỢP: CHECK OUT (Ra về) ---
  if (activeSession) {
    const now = new Date();
    // Tính thời gian tập (mili giây -> giờ)
    const durationMillis = now.getTime() - activeSession.checkInAt.getTime();
    const durationHours = durationMillis / (1000 * 60 * 60);

    // Transaction: Update CheckOut time + Cộng dồn giờ tập cho User
    await prisma.$transaction([
        prisma.checkIn.update({
            where: { id: activeSession.id },
            data: { checkOutAt: now }
        }),
        prisma.user.update({
            where: { id: userId },
            data: { totalHours: { increment: durationHours } } // Cộng thêm giờ
        })
    ]);

    revalidatePath('/progress');
    return { success: true, status: 'OUT', message: `Check-out thành công! Bạn đã tập ${durationHours.toFixed(1)} giờ.` };
  } 
  
  // --- TRƯỜNG HỢP: CHECK IN (Vào tập) ---
  else {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastCheckIn: true, currentStreak: true }
    });

    if (!user) return { success: false, message: 'Lỗi User' };

    const now = new Date();
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    let newStreak = user.currentStreak;

    // Logic Streak giữ nguyên (tính theo ngày liên tiếp)
    if (lastCheckIn) {
        const diffDays = differenceInCalendarDays(now, lastCheckIn);
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
    } else {
        newStreak = 1;
    }

    await prisma.$transaction([
        prisma.checkIn.create({ data: { userId } }),
        prisma.user.update({
            where: { id: userId },
            data: { 
                totalCheckIns: { increment: 1 },
                lastCheckIn: now,
                currentStreak: newStreak
            }
        })
    ]);

    revalidatePath('/progress');
    return { success: true, status: 'IN', message: 'Check-in thành công! Cháy hết mình nào 🔥' };
  }
}

// --- DATA FETCHING ---
export async function getDashboardData(userId: string) {
  // SỬA: Chỉ lấy data check-in trong 7 ngày qua
  const sevenDaysAgo = subDays(new Date(), 7); 

  const [userStats, activeSub, schedules, metrics, history] = await Promise.all([
    // 1. Lấy thêm totalHours
    prisma.user.findUnique({ 
        where: { id: userId },
        select: { currentStreak: true, totalCheckIns: true, totalHours: true } 
    }),
    prisma.subscription.findFirst({
        where: { userId, isActive: true, endDate: { gte: new Date() } },
        include: { plan: true },
        orderBy: { endDate: 'desc' }
    }),
    prisma.workoutSchedule.findMany({ 
        where: { userId }, 
        orderBy: { date: 'asc' }
    }),
    prisma.bodyMetric.findMany({ 
        where: { userId }, 
        orderBy: { recordedAt: 'asc' } 
    }),
    // 2. Lọc lịch sử 7 ngày
    prisma.checkIn.findMany({
        where: { 
            userId,
            checkInAt: { gte: sevenDaysAgo } // Điều kiện lọc ngày
        },
        orderBy: { checkInAt: 'desc' },
        // Bỏ take: 10 đi nếu muốn hiện hết trong tuần, hoặc giữ lại tuỳ bạn
    })
  ]);

  const isWorkingOut = history.length > 0 && history[0].checkOutAt === null;

  return { 
      stats: userStats, 
      plan: activeSub?.plan, 
      subscription: activeSub, 
      schedules, 
      metrics, 
      history,
      isWorkingOut
  };
}

// ... Các hàm khác giữ nguyên

// --- QUẢN LÝ LỊCH ---
export async function addSchedule(userId: string, title: string, date: Date, type: 'WITH_TRAINER' | 'SELF_PRACTICE', trainerName?: string) {
  await prisma.workoutSchedule.create({
    data: { userId, title, date, type, trainerName: trainerName || null }
  });
  revalidatePath('/progress');
}

export async function toggleScheduleStatus(scheduleId: string, currentStatus: boolean) {
  await prisma.workoutSchedule.update({
    where: { id: scheduleId },
    data: { isCompleted: !currentStatus }
  });
  revalidatePath('/progress');
}

// --- QUẢN LÝ BMI ---
export async function addBodyMetric(userId: string, height: number, weight: number) {
  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
  await prisma.bodyMetric.create({
    data: { userId, height, weight, bmi }
  });
  revalidatePath('/progress');
}