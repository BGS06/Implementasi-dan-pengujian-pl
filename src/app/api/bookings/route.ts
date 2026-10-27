import { NextResponse } from 'next/server';
import { BookingService } from '@/services/BookingService';
import { BookingRepository } from '@/repositories/BookingRepository';

// Inisialisasi Service dan Repository
const bookingService = new BookingService();
const bookingRepo = new BookingRepository(); 

export async function GET() {
  const bookings = await bookingService.getAllBookings();
  return NextResponse.json({ data: bookings });
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    // Memanggil bookingRepo yang sudah diinisialisasi di atas
    const updated = await bookingRepo.updateStatus(id, status);
    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui status';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const booking = await bookingService.createBooking({
      userId: body.userId || 'usr-1',
      carId: body.carId,
      startDate: body.startDate,
      endDate: body.endDate
    });
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal membuat booking';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}