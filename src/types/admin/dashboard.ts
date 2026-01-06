// @/types/dashboard.ts
export interface DashboardStats {
  stats: {
    totalMembers: number;
    activeEquipment: number;
    todayCheckIns: number;
    revenue: number;
  };
  chartData: { name: string; amount: number }[];
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: string;
  amount: number;
  createdAt: Date;
  user: { name: string | null };
  subscription: { plan: { name: string } };
}

export interface CurrentUser {
  id: string;
  name: string | null;
  role: string;
}

// Interface cho Staff Dashboard
export interface StaffSession {
  id: string;
  checkInAt: Date;
}

export interface Task {
  id: string;
  content: string;
  isDone: boolean;
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface ChartDataPoint {
  name: string;
  amount: number;
}

export interface RecentTransaction {
  id: string;
  amount: number;
  createdAt: Date;
  user: { name: string | null };
  subscription: { plan: { name: string } };
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
export interface DashboardFilterState {
  year: number;
  month: number | undefined;
}