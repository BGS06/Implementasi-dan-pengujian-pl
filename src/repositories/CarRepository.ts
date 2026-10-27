import { Car } from '@/domain/models/Car';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export class CarRepository {
  private generateId(): string {
    return 'C' + Math.floor(100 + Math.random() * 900).toString();
  }

  async findAll(): Promise<Car[]> {
    if (!isSupabaseConfigured()) return [];

    // JOIN antara vehicles, cars (subclass), dan gps_coordinates
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        cars!inner(seat_capacity),
        gps_coordinates(latitude, longitude)
      `)
      .order('id', { ascending: true });

    if (error || !data) return [];

    return data.map((row) => {
      const gps = Array.isArray(row.gps_coordinates) ? row.gps_coordinates[0] : row.gps_coordinates;
      return new Car(
        row.id,
        row.brand,
        row.model,
        row.license_plate,
        'CAR', 
        row.cars?.seat_capacity || 4,
        'Automatic', // Field default karena tidak ada di tabel vehicles
        Number(row.base_rate_per_day),
        row.status,
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
        gps?.latitude || -6.9733,
        gps?.longitude || 107.6304
      );
    });
  }

  async create(carData: Partial<Car>): Promise<Car | null> {
    const vId = this.generateId();
    
    // 1. Insert ke tabel Parent (Vehicles)
    await supabase.from('vehicles').insert({
      id: vId,
      brand: carData.brand,
      model: carData.model,
      license_plate: carData.plateNumber,
      base_rate_per_day: carData.pricePerDay,
      status: 'AVAILABLE'
    });

    // 2. Insert ke tabel Child (Cars)
    await supabase.from('cars').insert({
      vehicle_id: vId,
      seat_capacity: carData.seats || 5
    });

    // 3. Insert ke komponen relasi (GPS)
    await supabase.from('gps_coordinates').insert({
      vehicle_id: vId,
      latitude: -6.9733,
      longitude: 107.6304,
      speed_kmh: 0,
      updated_at: new Date().toISOString()
    });

    return null; // reload via findAll di service
  }

  async updateStatus(id: string, status: string) {
    await supabase.from('vehicles').update({ status }).eq('id', id);
  }
}