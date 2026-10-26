import { Booking } from '@/domain/models/Booking';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const IN_MEMORY_BOOKINGS: Booking[] = [
  new Booking(
    'bk-101',
    'usr-1',
    'car-1',
    'Toyota Innova Zenix Hybrid',
    '2026-10-28',
    '2026-10-30',
    2,
    1170000,
    'CONFIRMED'
  )
];

export class BookingRepository {
  async findAll(): Promise<Booking[]> {
    if (!isSupabaseConfigured()) return IN_MEMORY_BOOKINGS;

    const { data, error } = await supabase
      .from('bookings')
      .select('*, cars(brand, model)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return IN_MEMORY_BOOKINGS;

    return data.map((row) => {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
      const carName = row.cars ? `${row.cars.brand} ${row.cars.model}` : row.car_id;

      return new Booking(
        row.id,
        row.user_id,
        row.car_id,
        carName,
        row.start_date,
        row.end_date,
        days,
        Number(row.total_price),
        row.status
      );
    });
  }

  async create(booking: Booking): Promise<Booking> {
    IN_MEMORY_BOOKINGS.unshift(booking);

    if (isSupabaseConfigured()) {
      await supabase.from('bookings').insert({
        id: booking.id,
        user_id: booking.userId,
        car_id: booking.carId,
        start_date: booking.startDate,
        end_date: booking.endDate,
        total_price: booking.totalPrice,
        status: booking.status
      });
    }

    return booking;
  }

  // Tambahkan method ini di dalam class BookingRepository pada src/repositories/BookingRepository.ts:
  async updateStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<Booking | null> {
    const item = IN_MEMORY_BOOKINGS.find((b) => b.id === id);
    if (item) item.status = status;
    return item || null;
  }
}