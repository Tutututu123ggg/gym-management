import { PrismaClient, Role } from '@prisma/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { UpsertKPIParams, StaffKPIResult } from '@/types/admin/staff';

export class StaffService {
  constructor(private db: PrismaClient) {}

  // 1. Lấy danh sách nhân viên và KPI theo tháng
  async getStaffKPIs(month: Date): Promise<StaffKPIResult[]> {
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);

    const staffList = await this.db.user.findMany({
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

    // Map dữ liệu
    return staffList.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      
      kpiData: user.staffKPIs[0] ? {
        kpiScore: user.staffKPIs[0].kpiScore,
        sessions: user.staffKPIs[0].sessions,
        bonus: user.staffKPIs[0].bonus,
        notes: user.staffKPIs[0].notes
      } : null,

      suggestedSessions: user.taughtClasses.length
    }));
  }

  // 2. Lưu hoặc Cập nhật KPI
  async upsertKPI(data: UpsertKPIParams) {
    const firstDayOfMonth = startOfMonth(new Date(data.month));

    return await this.db.staffKPI.upsert({
      where: {
        userId_month: { 
          userId: data.userId,
          month: firstDayOfMonth
        }
      },
      update: {
        kpiScore: data.kpiScore,
        sessions: data.sessions,
        bonus: data.bonus,
        notes: data.notes
      },
      create: {
        userId: data.userId,
        month: firstDayOfMonth,
        kpiScore: data.kpiScore,
        sessions: data.sessions,
        bonus: data.bonus,
        notes: data.notes
      }
    });
  }
}