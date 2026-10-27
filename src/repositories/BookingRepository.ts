import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export class BookingRepository {
  private generateId(): string {
    return 'B' + Math.floor(100 + Math.random() * 900).toString();
  }

  async findAll() {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('bookings')
      .select('*, vehicles(brand, model)');

    if (error || !data) return [];

    return data.map((row) => {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
      // Menyesuaikan dengan struktur JOIN tabel vehicles
      const carName = row.vehicles ? `${row.vehicles.brand} ${row.vehicles.model}` : row.vehicle_id;

      return {
        id: row.id,
        userId: row.customer_id,
        carName: carName,
        startDate: row.start_date,
        endDate: row.end_date,
        totalDays: days,
        totalPrice: 500000 * days, // Placeholder kalkulasi
        status: row.status || 'CONFIRMED'
      };
    });
  }

  async create(booking: { userId: string; carId: string; startDate: string; endDate: string }) {
    const id = this.generateId();
    await supabase.from('bookings').insert({
      id: id,
      customer_id: booking.userId,
      vehicle_id: booking.carId,
      start_date: booking.startDate,
      end_date: booking.endDate,
      status: 'CONFIRMED'
    });
    return { id };
  }

  // ==== INI ADALAH FUNGSI YANG HILANG ====
  async updateStatus(id: string, status: string) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Gagal update status booking:", error.message);
      throw new Error(error.message);
    }
    
    return data;
  }
}