export interface UserStats {
  totalHours: number;
  totalCheckIns: number;
  currentStreak: number;
}

export interface Plan {
  id: string;
  name: string;
}

export interface Subscription {
  id: string;
  plan: Plan;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
}

export interface CheckInHistory {
  id: string;
  checkInAt: string | Date;
  checkOutAt?: string | Date | null;
}

export interface Schedule {
  id: string;
  title: string;
  date: Date;
  type: string; // 'SELF_PRACTICE' | 'WITH_TRAINER' | 'CLASS'
  trainerName?: string;
  room?: string;       // [NEW] Tên phòng học
  isCompleted: boolean;
  isClass?: boolean;   // [NEW] Cờ đánh dấu đây là lớp học từ Booking
}

export interface BodyMetric {
  id: string;
  userId: string;
  height: number;
  weight: number;
  bmi: number;
  recordedAt: string | Date;
}

export interface DashboardData {
  stats: UserStats;
  plan: Plan | null;
  subscription: Subscription | null;
  isWorkingOut: boolean;
  history: CheckInHistory[];
  schedules: Schedule[];
  metrics: BodyMetric[];
}