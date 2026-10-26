export class GpsCoordinate {
  constructor(
    public readonly carId: string,
    public latitude: number,
    public longitude: number,
    public speedKmh: number = 0,
    public updatedAt: string = new Date().toISOString()
  ) {}
}