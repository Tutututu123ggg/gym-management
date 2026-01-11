"use server";

import prisma from '@/lib/prisma';
import { addDays } from 'date-fns';
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { protect } from '@/lib/auth-guard'; // [NEW]

// 1. Lấy Resource
export async function getScheduleResources() {
  try {
    await protect(['ADMIN', 'STAFF', 'TRAINER']); // 🔒

    const [trainers, rooms, gymClasses] = await prisma.$transaction([
      prisma.user.findMany({ where: { role: 'TRAINER' }, select: { id: true, name: true } }),
      prisma.room.findMany({ select: { id: true, name: true } }),
      prisma.gymClass.findMany({
        where: { isActive: true },
        select: { id: true, name: true, plan: { select: { name: true } } }
      })
    ]);
    return { success: true, trainers, rooms, gymClasses };
  } catch (error) {
    return { success: false, trainers: [], rooms: [], gymClasses: [] };
  }
}

// 2. Lấy Lịch
export async function getClassSessions(from: Date, to: Date, gymClassId?: string) {
  try {
    await protect(['ADMIN', 'STAFF', 'TRAINER']); // 🔒

    const whereCondition: Prisma.ClassSessionWhereInput = {
      startTime: { gte: from },
      endTime: { lte: to },
      isCanceled: false
    };

    if (gymClassId) whereCondition.gymClassId = gymClassId;

    const sessions = await prisma.classSession.findMany({
      where: whereCondition,
      include: {
        gymClass: { select: { name: true, plan: { select: { name: true } } } },
        trainer: { select: { name: true } },
        room: { select: { name: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { startTime: 'asc' }
    });
    
    const events = sessions.map(s => ({
      id: s.id,
      title: `${s.gymClass.name} (${s.trainer?.name || 'No Trainer'})`,
      start: s.startTime,
      end: s.endTime,
      resource: {
        room: s.room?.name,
        capacity: s.maxCapacity,
        booked: s._count.bookings
      }
    }));

    return { success: true, data: events };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// 3. Tạo Lịch (Bulk Create)
export async function createClassSchedule(data: {
  gymClassId: string;
  trainerId: string;
  roomId: string;
  startTime: string; 
  durationMinutes: number;
  maxCapacity: number;
  startDate: Date;
  endDate: Date;
  repeatDays: number[];
}) {
  try {
    await protect(['ADMIN', 'STAFF']); // 🔒

    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const sessionsToCreate = [];
    let currentDate = new Date(data.startDate);
    const endLoopDate = new Date(data.endDate);

    while (currentDate <= endLoopDate) {
      const dayOfWeek = currentDate.getDay(); 
      if (data.repeatDays.includes(dayOfWeek)) {
        const sessionStart = new Date(currentDate);
        sessionStart.setHours(startHour, startMinute, 0, 0);
        const sessionEnd = new Date(sessionStart.getTime() + data.durationMinutes * 60000);

        sessionsToCreate.push({
          gymClassId: data.gymClassId,
          trainerId: data.trainerId,
          roomId: data.roomId,
          startTime: sessionStart,
          endTime: sessionEnd,
          maxCapacity: data.maxCapacity
        });
      }
      currentDate = addDays(currentDate, 1);
    }

    if (sessionsToCreate.length > 0) {
      await prisma.classSession.createMany({ data: sessionsToCreate });
    }
    revalidatePath('/admin/schedule');
    return { success: true, message: `Đã tạo ${sessionsToCreate.length} buổi học!` };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Lỗi tạo lịch." };
  }
}

// 4. Hủy buổi học
export async function cancelSession(sessionId: string) {
  try {
    await protect(['ADMIN', 'STAFF']); // 🔒

    await prisma.classSession.update({ where: { id: sessionId }, data: { isCanceled: true } });
    revalidatePath('/admin/schedule');
    return { success: true, message: "Đã hủy." };
  } catch (error) { return { success: false, message: "Lỗi." }; }
}