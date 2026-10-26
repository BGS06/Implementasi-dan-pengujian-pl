import { NextResponse } from 'next/server';
import { CarRepository } from '@/repositories/CarRepository';
import { Car } from '@/domain/models/Car';

const carRepo = new CarRepository();

export async function GET() {
  const cars = await carRepo.findAll();
  return NextResponse.json({ data: cars });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newCar = new Car(
    `car-${Date.now()}`,
    body.brand,
    body.model,
    body.plateNumber,
    body.category || 'MPV',
    Number(body.seats) || 5,
    body.transmission || 'Automatic',
    Number(body.pricePerDay) || 500000,
    'AVAILABLE',
    body.imageUrl ||
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/2023_Toyota_Kijang_Innova_Zenix_2.0_Q_HV_TSS_Modellista_%28Indonesia%29_front_view.jpg/800px-2023_Toyota_Kijang_Innova_Zenix_2.0_Q_HV_TSS_Modellista_%28Indonesia%29_front_view.jpg'
  );
  await carRepo.create(newCar);
  return NextResponse.json({ data: newCar }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { id, status } = await request.json();
  const updated = await carRepo.updateStatus(id, status);
  return NextResponse.json({ data: updated });
}