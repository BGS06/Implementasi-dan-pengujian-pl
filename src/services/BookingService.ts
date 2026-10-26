import { BookingRepository } from '@/repositories/BookingRepository';
import { CarRepository } from '@/repositories/CarRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { Booking } from '@/domain/models/Booking';

export class BookingService {
  private bookingRepo = new BookingRepository();
  private carRepo = new CarRepository();
  private userRepo = new UserRepository();

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepo.findAll();
  }

  async createBooking(params: {
    userId: string;
    carId: string;
    startDate: string;
    endDate: string;
  }): Promise<Booking> {
    const car = await this.carRepo.findById(params.carId);
    if (!car) throw new Error('Mobil tidak ditemukan');

    const user = await this.userRepo.findById(params.userId);
    if (!user) throw new Error('User tidak ditemukan');

    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const diffDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const baseCost = car.calculateBaseCost(diffDays);
    const finalPrice = user.membership.applyDiscount(baseCost);

    const newBooking = new Booking(
      `bk-${Date.now()}`,
      user.id,
      car.id,
      car.fullName,
      params.startDate,
      params.endDate,
      diffDays,
      finalPrice,
      'CONFIRMED'
    );

    return this.bookingRepo.create(newBooking);
  }
}