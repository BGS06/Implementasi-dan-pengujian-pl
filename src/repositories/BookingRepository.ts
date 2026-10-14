// src/repositories/BookingRepository.ts
import { prisma } from '../lib/supabase';

export class BookingRepository {
  public async findByCustomerId(customerId: string) {
    return prisma.booking.findMany({
      where: { customerId },
      include: { car: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAllWithDetails() {
    return prisma.booking.findMany({
      include: { customer: true, car: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}