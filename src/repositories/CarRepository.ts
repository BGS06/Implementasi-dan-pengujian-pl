import { Car } from '@/domain/models/Car';
import { IRepository } from '@/domain/interfaces';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const MOCK_CARS: Car[] = [
  new Car(
    'car-1',
    'Toyota',
    'Innova Zenix Hybrid',
    'D 1201 YJ',
    'MPV',
    7,
    'Automatic',
    650000,
    'AVAILABLE',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/2023_Toyota_Kijang_Innova_Zenix_2.0_Q_HV_TSS_Modellista_%28Indonesia%29_front_view.jpg/800px-2023_Toyota_Kijang_Innova_Zenix_2.0_Q_HV_TSS_Modellista_%28Indonesia%29_front_view.jpg',
    -6.9733,
    107.6304
  ),
  new Car(
    'car-2',
    'Hyundai',
    'IONIQ 5 Signature',
    'D 8821 EV',
    'EV',
    5,
    'Automatic',
    850000,
    'AVAILABLE',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Hyundai_Ioniq_5_AWD_Techniq-Paket_%E2%80%93_f_31122021.jpg/800px-Hyundai_Ioniq_5_AWD_Techniq-Paket_%E2%80%93_f_31122021.jpg',
    -6.9175,
    107.6191
  ),
  new Car(
    'car-3',
    'Mitsubishi',
    'Pajero Sport Dakar',
    'D 1994 SUV',
    'SUV',
    7,
    'Automatic',
    750000,
    'AVAILABLE',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/2021_Mitsubishi_Pajero_Sport_2.4_Dakar_Ultimate_4x2_%28Indonesia%29_front_view.jpg/800px-2021_Mitsubishi_Pajero_Sport_2.4_Dakar_Ultimate_4x2_%28Indonesia%29_front_view.jpg',
    -6.8915,
    107.6107
  ),
  new Car(
    'car-4',
    'Honda',
    'Civic RS Turbo',
    'D 4040 SR',
    'SEDAN',
    5,
    'Automatic',
    700000,
    'AVAILABLE',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2022_Honda_Civic_RS_%28FE%29_sedan_%28Indonesia%29_front_view.jpg/800px-2022_Honda_Civic_RS_%28FE%29_sedan_%28Indonesia%29_front_view.jpg',
    -6.9500,
    107.6250
  )
];

export class CarRepository implements IRepository<Car> {
  async findAll(): Promise<Car[]> {
    if (!isSupabaseConfigured()) return MOCK_CARS;

    const { data, error } = await supabase.from('cars').select('*');
    if (error || !data || data.length === 0) return MOCK_CARS;

    return data.map(
      (row) =>
        new Car(
          row.id,
          row.brand,
          row.model,
          row.plate_number,
          row.category,
          row.seats,
          row.transmission,
          Number(row.price_per_day),
          row.status,
          row.image_url || MOCK_CARS[0].imageUrl,
          row.latitude ?? -6.9733,
          row.longitude ?? 107.6304
        )
    );
  }

  async findById(id: string): Promise<Car | null> {
    const cars = await this.findAll();
    return cars.find((c) => c.id === id) || null;
  }

  // Tambahkan 2 method ini di dalam class CarRepository pada src/repositories/CarRepository.ts:
  async create(car: Car): Promise<Car> {
    MOCK_CARS.push(car);
    return car;
  }

  async updateStatus(id: string, status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'): Promise<Car | null> {
    const car = MOCK_CARS.find((c) => c.id === id);
    if (car) car.status = status;
    return car || null;
  }
}

