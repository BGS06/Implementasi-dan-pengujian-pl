// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/services/BookingService';
import { BookingRepository } from '@/repositories/BookingRepository';

const bookingService = new BookingService();
const bookingRepo = new BookingRepository();

export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get('customerId');
    const data = customerId
      ? await bookingRepo.findByCustomerId(customerId)
      : await bookingRepo.findAllWithDetails();
    return NextResponse.json({ bookings: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await bookingService.createBooking(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
