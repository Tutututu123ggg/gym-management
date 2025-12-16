'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPlans() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc', // Sắp xếp theo giá tăng dần
      }
    });
    return plans;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }
}