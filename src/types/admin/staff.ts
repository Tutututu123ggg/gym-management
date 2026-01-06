import { Role } from '@prisma/client';

export interface StaffKPIResult {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  department: string | null;
  avatar: string | null;
  
  // Dữ liệu KPI đã lưu trong DB
  kpiData: {
    kpiScore: number;
    sessions: number;
    bonus: number;
    notes: string | null;
  } | null;

  // Dữ liệu gợi ý từ hệ thống (số buổi dạy thực tế)
  suggestedSessions: number;
}

export interface UpsertKPIParams {
  userId: string;
  month: Date;
  kpiScore: number;
  sessions: number;
  bonus: number;
  notes?: string;
}

// State lưu giá trị đang nhập trên UI (Draft)
export interface EditState {
  kpi: number;
  sessions: number;
  bonus: number;
  notes: string;
}

export interface StaffActionResult {
  success: boolean;
  message?: string;
  data?: StaffKPIResult[];
}