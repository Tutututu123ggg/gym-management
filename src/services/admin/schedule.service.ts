import { PrismaClient, Prisma } from '@prisma/client';
import { addDays } from 'date-fns';
import { CreateScheduleInput } from '@/types/admin/plan';

export class ScheduleService {
  constructor(private db: PrismaClient) {}

  async getResources() {
    const [trainers, rooms] = await this.db.$transaction([
      this.db.user.findMany({ where: { role: 'TRAINER' }, select: { id: true, name: true } }),
      this.db.room.findMany({ select: { id: true, name: true } })
    ]);
    return { trainers, rooms };
  }

  async getSessions(from: Date, to: Date, gymClassId?: string) {
    const where: Prisma.ClassSessionWhereInput = {
      startTime: { gte: from },
      endTime: { lte: to },
      isCanceled: false
    };
    if (gymClassId) where.gymClassId = gymClassId;

    return await this.db.classSession.findMany({
      where,
      include: {
        gymClass: { select: { name: true } },
        trainer: { select: { name: true } },
        room: { select: { name: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async createBulk(data: CreateScheduleInput) {
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const sessions = [];
    let current = new Date(data.startDate);
    const end = new Date(data.endDate);

    while (current <= end) {
      if (data.repeatDays.includes(current.getDay())) {
        const start = new Date(current);
        start.setHours(startHour, startMinute, 0, 0);
        const endSession = new Date(start.getTime() + data.durationMinutes * 60000);

        sessions.push({
          gymClassId: data.gymClassId,
          trainerId: data.trainerId,
          roomId: data.roomId,
          startTime: start,
          endTime: endSession,
          maxCapacity: data.maxCapacity
        });
      }
      current = addDays(current, 1);
    }

    if (sessions.length > 0) await this.db.classSession.createMany({ data: sessions });
    return sessions.length;
  }
}