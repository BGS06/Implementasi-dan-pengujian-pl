// src/app/api/cars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CarRepository } from '@/repositories/CarRepository';

const carRepo = new CarRepository();

export async function GET(req: NextRequest) {
  try {
    const onlyAvailable = req.nextUrl.searchParams.get('available') === 'true';
    const cars = await carRepo.findAll(onlyAvailable);
    return NextResponse.json({
      cars: cars.map((car) => ({
        id: car.getId(),
        fullName: car.getFullName(),
        category: car.getCategory(),
        licensePlate: car.getLicensePlate(),
        seatCapacity: car.getSeatCapacity(),
        transmission: car.getTransmission(),
        fuelType: car.getFuelType(),
        baseRatePerDay: car.getBaseRatePerDay(),
        insuranceFeePerDay: car.getInsuranceFeePerDay(),
        dailyCostSample: car.calculateRentalCost(1),
        status: car.getStatus(),
        telemetry: car.getTrackingTelemetry(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}