"use server";

import prisma from "@/lib/prisma";
import { 
  startOfMonth, endOfMonth, startOfYear, endOfYear, 
  format, eachMonthOfInterval, eachDayOfInterval, 
  isSameDay, isSameMonth 
} from "date-fns";
import { DashboardStats, ChartDataPoint, RecentTransaction } from "@/types/admin/dashboard";

// --- LAYER 1: DATA ACCESS (Repository Pattern) ---
// Hàm này chỉ chịu trách nhiệm giao tiếp với Database, không xử lý logic hiển thị
async function fetchRawData(startDate: Date, endDate: Date) {
  return Promise.all([
    // 1. Đếm số liệu tổng quan
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.equipment.count({ where: { status: 'GOOD' } }),
    prisma.checkIn.count({
      where: { checkInAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    }),
    prisma.invoice.aggregate({
      where: { status: 'PAID', createdAt: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    }),
    // 2. Dữ liệu cho biểu đồ (Lấy thô)
    prisma.invoice.findMany({
      where: { status: 'PAID', createdAt: { gte: startDate, lte: endDate } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    }),
    // 3. Giao dịch gần đây
    prisma.invoice.findMany({
      take: 5,
      where: { status: 'PAID' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, createdAt: true,
        user: { select: { name: true } },
        subscription: { select: { plan: { select: { name: true } } } }
      }
    })
  ]);
}

// --- LAYER 2: DATA TRANSFORMATION (Service Logic) ---
// Hàm này thuần túy xử lý logic biến đổi dữ liệu, không gọi DB
function processChartData(
  invoices: { amount: number; createdAt: Date }[], 
  year: number, 
  month?: number
): ChartDataPoint[] {
  if (month) {
    // Logic gộp theo ngày trong tháng
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(new Date(year, month - 1)),
      end: endOfMonth(new Date(year, month - 1))
    });
    return daysInMonth.map(day => ({
      name: format(day, 'dd/MM'),
      amount: invoices
        .filter(i => isSameDay(i.createdAt, day))
        .reduce((sum, i) => sum + i.amount, 0)
    }));
  } else {
    // Logic gộp theo tháng trong năm
    const monthsInYear = eachMonthOfInterval({
      start: startOfYear(new Date(year, 0)),
      end: endOfYear(new Date(year, 0))
    });
    return monthsInYear.map(mon => ({
      name: `T${format(mon, 'MM')}`,
      amount: invoices
        .filter(i => isSameMonth(i.createdAt, mon))
        .reduce((sum, i) => sum + i.amount, 0)
    }));
  }
}

// --- LAYER 3: CONTROLLER (Main Entry Point) ---
// Hàm này điều phối: Gọi Data Access -> Gọi Transformation -> Trả về kết quả
export async function getDashboardStats(year: number, month?: number): Promise<DashboardStats> {
  // 1. Chuẩn bị tham số thời gian
  const startDate = month ? startOfMonth(new Date(year, month - 1)) : startOfYear(new Date(year, 0));
  const endDate = month ? endOfMonth(new Date(year, month - 1)) : endOfYear(new Date(year, 11));

  // 2. Gọi Layer Data Access
  const [
    totalMembers, 
    activeEquipment, 
    todayCheckIns, 
    revenueAgg, 
    invoices, 
    recentTransactionsRaw
  ] = await fetchRawData(startDate, endDate);

  // 3. Mapping Type an toàn (Adapter)
  // Lưu ý: Cần đảm bảo select trong fetchRawData khớp với Interface RecentTransaction
  const recentTransactions = recentTransactionsRaw as unknown as RecentTransaction[];

  // 4. Trả về kết quả cuối cùng
  return {
    stats: {
      totalMembers,
      activeEquipment,
      todayCheckIns,
      revenue: revenueAgg._sum.amount || 0
    },
    chartData: processChartData(invoices, year, month),
    recentTransactions
  };
}