import { BookingStatus } from '../interfaces';

export class Booking {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly carId: string,
    public readonly carName: string,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly totalDays: number,
    public readonly totalPrice: number,
    public status: BookingStatus = 'CONFIRMED'
  ) {}
}