// src/app/api/gps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CarRepository } from '@/repositories/CarRepository';

const carRepo = new CarRepository();

export async function GET() {
  try {
    const cars = await carRepo.findAll(false);
    const telemetryList = cars.map((car) => ({
      carId: car.getId(),
      fullName: car.getFullName(),
      category: car.getCategory(),
      status: car.getStatus(),
      ...car.getTrackingTelemetry(),
    }));
    return NextResponse.json({ fleetTelemetry: telemetryList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { carId, latitude, longitude, speedKmh = 0 } = await req.json();
    const updatedCar = await carRepo.updateGpsLocation(
      carId,
      Number(latitude),
      Number(longitude),
      Number(speedKmh)
    );
    return NextResponse.json({
      message: 'Koordinat GPS berhasil diperbarui',
      telemetry: updatedCar.getTrackingTelemetry(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
