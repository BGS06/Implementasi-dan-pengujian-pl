import { CarStatus } from '../interfaces';

export class Car {
  constructor(
    public readonly id: string,
    public brand: string,
    public model: string,
    public plateNumber: string,
    public category: 'MPV' | 'SUV' | 'EV' | 'SEDAN',
    public seats: number,
    public transmission: 'Automatic' | 'Manual',
    public pricePerDay: number,
    public status: CarStatus = 'AVAILABLE',
    public imageUrl: string = '',
    public latitude: number = -6.9733,
    public longitude: number = 107.6304
  ) {}

  public get fullName(): string {
    return `${this.brand} ${this.model}`;
  }

  public calculateBaseCost(days: number): number {
    if (days <= 0) throw new Error('Durasi sewa minimal 1 hari');
    return this.pricePerDay * days;
  }
}