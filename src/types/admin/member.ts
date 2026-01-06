import { Prisma, PlanCategory } from '@prisma/client';

// --- MODELS ---
export type MemberWithDetails = Prisma.UserGetPayload<{
  include: {
    subscriptions: { include: { plan: true } };
    bookings: {
      include: {
        classSession: { include: { gymClass: true; trainer: true } };
      };
    };
  };
}>;

export interface PlanWithPromo {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  promotions: {
    id: string;
    salePrice: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }[];
}

// --- INPUTS ---
export interface CreateMemberInput {
  email: string;
  name: string;
  phone: string;
  planId: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'POS';
}

export interface UpdateMemberInput {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

// --- RESPONSES ---
export interface MemberResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  newAccount?: { email: string; password: string };
}

export interface PaginatedMemberResult {
  data: MemberWithDetails[];
  total: number;
  totalPages: number;
  currentPage: number;
}