import { Prisma, PlanCategory, Promotion } from '@prisma/client';

// --- MODELS ---
export type PlanWithPromo = Prisma.PlanGetPayload<{
  include: {
    _count: { select: { subscriptions: true } };
    promotions: true;
  };
}> & { currentPromo?: Promotion | null };

export type GymClassWithStats = Prisma.GymClassGetPayload<{
  include: { _count: { select: { sessions: true } } };
}>;

// --- INPUTS ---
export interface UpsertPlanInput {
  id?: string;
  name: string;
  price: number;
  durationDays: number;
  category: PlanCategory;
  desc: string;
  isActive: boolean;
  image?: string;
}

export interface CreateScheduleInput {
  gymClassId: string;
  trainerId: string;
  roomId: string;
  startTime: string; // "18:00"
  durationMinutes: number;
  maxCapacity: number;
  startDate: Date;
  endDate: Date;
  repeatDays: number[]; // [0, 1, 3] (CN, T2, T4)
}

// --- CALENDAR ---
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    room: string;
    capacity: number;
    booked: number;
  };
}