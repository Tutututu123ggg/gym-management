'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfMonth, endOfMonth } from 'date-fns'
import { Role } from '@prisma/client' 

// --- TYPES DEFINITION ---

// Định nghĩa cấu trúc dữ liệu trả về cho Client
export interface StaffKPIResult {
  id: string;
  name: string | null;
  email: string | null;
  role: Role; 
  department: string | null;
  avatar: string | null;
  
  // Dữ liệu KPI
  kpiData: {
    kpiScore: number;
    sessions: number;
    bonus: number; // 👈 ĐÃ THÊM: Tiền thưởng
    notes: string | null;
  } | null;

  suggestedSessions: number; 
}

export interface KPIActionResult {
  success: boolean;
  message?: string;
  data?: StaffKPIResult[];
}

export interface UpsertKPIParams {
  userId: string;
  month: Date;
  kpiScore: number;
  sessions: number;
  bonus: number; // 👈 ĐÃ THÊM: Tham số tiền thưởng
  notes?: string;
}

// --- 1. LẤY DANH SÁCH STAFF & KPI ---
export async function getStaffKPIs(month: Date): Promise<KPIActionResult> {
  try {
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);

    const staffList = await prisma.user.findMany({
      where: {
        role: { in: [Role.STAFF, Role.TRAINER] }
      },
      include: {
        staffKPIs: {
          where: { month: startDate }
        },
        taughtClasses: {
          where: {
            startTime: { gte: startDate, lte: endDate },
            isCanceled: false 
          },
          select: { id: true } 
        }
      },
      orderBy: { role: 'asc' }
    });

    // Map dữ liệu (Type safe)
    const formattedData: StaffKPIResult[] = staffList.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      
      kpiData: user.staffKPIs[0] ? {
        kpiScore: user.staffKPIs[0].kpiScore,
        sessions: user.staffKPIs[0].sessions,
        bonus: user.staffKPIs[0].bonus, // 👈 ĐÃ THÊM: Map dữ liệu từ DB
        notes: user.staffKPIs[0].notes
      } : null,

      suggestedSessions: user.taughtClasses.length
    }));

    return { success: true, data: formattedData };

  } catch (error) {
    console.error("Get Staff KPI Error:", error);
    return { success: false, message: "Lỗi lấy dữ liệu nhân sự" };
  }
}

// --- 2. LƯU KPI ---
export async function upsertKPI(data: UpsertKPIParams): Promise<{ success: boolean; message: string }> {
  try {
    const firstDayOfMonth = startOfMonth(new Date(data.month));

    await prisma.staffKPI.upsert({
      where: {
        userId_month: { 
          userId: data.userId,
          month: firstDayOfMonth
        }
      },
      update: {
        kpiScore: data.kpiScore,
        sessions: data.sessions,
        bonus: data.bonus, // 👈 ĐÃ THÊM: Update bonus
        notes: data.notes
      },
      create: {
        userId: data.userId,
        month: firstDayOfMonth,
        kpiScore: data.kpiScore,
        sessions: data.sessions,
        bonus: data.bonus, // 👈 ĐÃ THÊM: Create bonus
        notes: data.notes
      }
    });

    revalidatePath('/admin/staff');
    return { success: true, message: "Đã lưu KPI & Thưởng thành công!" };
  } catch (error) {
    console.error("Upsert KPI Error:", error);
    return { success: false, message: "Lỗi khi lưu KPI" };
  }
}