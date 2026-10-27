export class Car {
  constructor(
    public readonly id: string,
    public brand: string,
    public model: string,
    public plateNumber: string,
    public category: string,
    public seats: number,
    public transmission: string,
    public pricePerDay: number,
    public status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' = 'AVAILABLE',
    public imageUrl: string = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
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