// src/domain/models/GpsCoordinate.ts

/**
 * Value Object yang mengenkapsulasi koordinat GPS dan perhitungan jarak Haversine
 * untuk fitur Live GPS Tracking.
 */
export class GpsCoordinate {
  private latitude: number;
  private longitude: number;
  private speedKmh: number;
  private updatedAt: Date;

  // Koordinat default garasi utama RentPod (Surabaya/Malang)
  public static readonly POOL_ORIGIN = new GpsCoordinate(-7.2575, 112.7521, 0);

  constructor(latitude: number, longitude: number, speedKmh: number = 0, updatedAt: Date = new Date()) {
    this.setCoordinates(latitude, longitude);
    this.speedKmh = Math.max(0, speedKmh);
    this.updatedAt = updatedAt;
  }

  public setCoordinates(lat: number, lng: number): void {
    if (lat < -90 || lat > 90) {
      throw new Error(`Latitude tidak valid: ${lat}. Harus berada di rentang -90 hingga 90.`);
    }
    if (lng < -180 || lng > 180) {
      throw new Error(`Longitude tidak valid: ${lng}. Harus berada di rentang -180 hingga 180.`);
    }
    this.latitude = lat;
    this.longitude = lng;
    this.updatedAt = new Date();
  }

  public getLatitude(): number {
    return this.latitude;
  }

  public getLongitude(): number {
    return this.longitude;
  }

  public getSpeedKmh(): number {
    return this.speedKmh;
  }

  public setSpeedKmh(speed: number): void {
    this.speedKmh = Math.max(0, speed);
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Menghitung jarak (km) antara posisi mobil saat ini dengan titik lain (rumus Haversine)
   */
  public distanceToKm(target: GpsCoordinate): number {
    const R = 6371; // Radius bumi dalam km
    const dLat = this.toRadians(target.getLatitude() - this.latitude);
    const dLng = this.toRadians(target.getLongitude() - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.latitude)) *
        Math.cos(this.toRadians(target.getLatitude())) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}