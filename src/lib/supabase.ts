// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Supabase Client untuk fitur Realtime Live GPS Tracking & Storage
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


Repository Armada Mobil & Update GPS (src/repositories/CarRepository.ts)

// src/repositories/CarRepository.ts
import { prisma } from '../lib/supabase';
import { Car, CarFactory } from '../domain/models/Car';
import { CarStatus } from '../domain/interfaces';

export class CarRepository {
  /**
   * Mengambil seluruh daftar mobil dari Supabase PostgreSQL dan mengubahnya menjadi objek OOP Car
   */
  public async findAll(onlyAvailable: boolean = false): Promise<Car[]> {
    const rows = await prisma.car.findMany({
      where: onlyAvailable ? { status: 'AVAILABLE' } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => CarFactory.fromDatabaseRow(row));
  }

  public async findById(carId: string): Promise<Car | null> {
    const row = await prisma.car.findUnique({ where: { id: carId } });
    if (!row) return null;
    return CarFactory.fromDatabaseRow(row);
  }

  public async updateStatus(carId: string, status: CarStatus): Promise<void> {
    await prisma.car.update({
      where: { id: carId },
      data: { status },
    });
  }

  /**
   * Memperbarui posisi koordinat GPS mobil di Supabase (otomatis memicu Supabase Realtime untuk Admin)
   */
  public async updateGpsLocation(
    carId: string,
    latitude: number,
    longitude: number,
    speedKmh: number
  ): Promise<Car> {
    const [updatedRow] = await prisma.$transaction([
      prisma.car.update({
        where: { id: carId },
        data: {
          latitude,
          longitude,
          speedKmh,
          lastGpsPing: new Date(),
        },
      }),
      prisma.gpsTrackingLog.create({
        data: {
          carId,
          latitude,
          longitude,
          speedKmh,
        },
      }),
    ]);

    return CarFactory.fromDatabaseRow(updatedRow);
  }
}