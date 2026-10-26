import { NextResponse } from 'next/server';
import { CarRepository } from '@/repositories/CarRepository';
import { GpsCoordinate } from '@/domain/models/GpsCoordinate';

const carRepo = new CarRepository();

export async function GET() {
  const cars = await carRepo.findAll();
  const coordinates = cars.map((car) => {
    const jitterLat = (Math.random() - 0.5) * 0.004;
    const jitterLng = (Math.random() - 0.5) * 0.004;
    const speed = Math.floor(25 + Math.random() * 45);
    return new GpsCoordinate(
      car.id,
      Number((car.latitude + jitterLat).toFixed(5)),
      Number((car.longitude + jitterLng).toFixed(5)),
      speed
    );
  });

  return NextResponse.json({ data: coordinates });
}