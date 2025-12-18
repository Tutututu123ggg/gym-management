"use server";

import prisma from "@/lib/prisma";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  format, 
  eachMonthOfInterval, 
  eachDayOfInterval,
  isSameDay,
  isSameMonth
} from "date-fns";

// --- INTERFACES ---

export interface ChartDataPoint {
  name: string;
  amount: number;
}

export interface RecentTransaction {
  id: string;
  amount: number;
  createdAt: Date;
  user: {
    name: string | null;
  };
  subscription: {
    plan: {
      name: string;
    };
  };
}

export interface DashboardStats {
  stats: {
    totalMembers: number;
    activeEquipment: number;
    todayCheckIns: number;
    revenue: number;
  };
  chartData: ChartDataPoint[];
  recentTransactions: RecentTransaction[];
}

// Interface cho dữ liệu thô từ Prisma
interface InvoiceSummary {
  amount: number;
  createdAt: Date;
}

// --- MAIN FUNCTION ---

export async function getDashboardStats(year: number, month?: number): Promise<DashboardStats> {
  const startDate = month 
    ? startOfMonth(new Date(year, month - 1)) 
    : startOfYear(new Date(year, 0));
  const endDate = month 
    ? endOfMonth(new Date(year, month - 1)) 
    : endOfYear(new Date(year, 11));

  const [totalMembers, activeEquipment, todayCheckIns, totalRevenue] = await Promise.all([
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.equipment.count({ where: { status: 'GOOD' } }),
    prisma.checkIn.count({
      where: {
        checkInAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }),
    prisma.invoice.aggregate({
      where: { 
        status: 'PAID', 
        createdAt: { gte: startDate, lte: endDate } 
      },
      _sum: { amount: true }
    })
  ]);

  // Lấy dữ liệu cho biểu đồ
  const invoices: InvoiceSummary[] = await prisma.invoice.findMany({
    where: { 
      status: 'PAID', 
      createdAt: { gte: startDate, lte: endDate } 
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  const chartData = month 
    ? aggregateByDay(invoices, year, month) 
    : aggregateByMonth(invoices, year);

  // Lấy giao dịch gần đây (Ép kiểu về RecentTransaction[])
  const recentTransactions = await prisma.invoice.findMany({
    take: 5,
    where: { status: 'PAID' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      user: { select: { name: true } },
      subscription: { 
        select: { 
          plan: { select: { name: true } } 
        } 
      }
    }
  }) as unknown as RecentTransaction[];

  return {
    stats: {
      totalMembers,
      activeEquipment,
      todayCheckIns,
      revenue: totalRevenue._sum.amount || 0
    },
    chartData,
    recentTransactions
  };
}

// --- HELPER FUNCTIONS ---

/**
 * Gom nhóm theo tháng (khi xem theo năm)
 */
function aggregateByMonth(invoices: InvoiceSummary[], year: number): ChartDataPoint[] {
  const monthsInYear = eachMonthOfInterval({ 
    start: startOfYear(new Date(year, 0)), 
    end: endOfYear(new Date(year, 0)) 
  });

  return monthsInYear.map(monthDate => {
    const total = invoices
      .filter(invoice => isSameMonth(invoice.createdAt, monthDate))
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    return {
      name: `T${format(monthDate, 'MM')}`,
      amount: total
    };
  });
}

/**
 * Gom nhóm theo ngày (khi xem theo tháng)
 */
function aggregateByDay(invoices: InvoiceSummary[], year: number, month: number): ChartDataPoint[] {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(new Date(year, month - 1)),
    end: endOfMonth(new Date(year, month - 1))
  });

  return daysInMonth.map(dayDate => {
    const total = invoices
      .filter(invoice => isSameDay(invoice.createdAt, dayDate))
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    return {
      name: format(dayDate, 'dd/MM'),
      amount: total
    };
  });
}