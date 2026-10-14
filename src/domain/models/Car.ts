// src/domain/models/Car.ts
import { CarCategory, CarStatus, ITrackable, TrackingTelemetry } from '../interfaces';
import { GpsCoordinate } from './GpsCoordinate';

export interface BaseCarProps {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  baseRatePerDay: number;
  seatCapacity: number;
  transmission: 'AUTOMATIC' | 'MANUAL';
  fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  status: CarStatus;
  imageUrl?: string;
  gpsCoordinate?: GpsCoordinate;
}

/**
 * Abstract Class Car yang mengimplementasikan ITrackable (Live GPS)
 * serta mendefinisikan method polimorfik calculateRentalCost().
 */
export abstract class Car implements ITrackable {
  protected readonly id: string;
  protected brand: string;
  protected model: string;
  protected year: number;
  protected licensePlate: string;
  protected baseRatePerDay: number;
  protected seatCapacity: number;
  protected transmission: 'AUTOMATIC' | 'MANUAL';
  protected fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  protected status: CarStatus;
  protected imageUrl: string;
  private gpsCoordinate: GpsCoordinate;

  // Batas radius operasional sebelum memicu peringatan geofence (km)
  private static readonly MAX_OPERATIONAL_RADIUS_KM = 150;

  constructor(props: BaseCarProps) {
    this.id = props.id;
    this.brand = props.brand;
    this.model = props.model;
    this.year = props.year;
    this.licensePlate = props.licensePlate;
    this.setBaseRatePerDay(props.baseRatePerDay);
    this.seatCapacity = props.seatCapacity;
    this.transmission = props.transmission;
    this.fuelType = props.fuelType;
    this.status = props.status;
    this.imageUrl = props.imageUrl || '/images/default-car.png';
    this.gpsCoordinate = props.gpsCoordinate || new GpsCoordinate(-7.2575, 112.7521, 0);
  }

  public getId(): string { return this.id; }
  public getBrand(): string { return this.brand; }
  public getModel(): string { return this.model; }
  public getFullName(): string { return `${this.brand} ${this.model} (${this.year})`; }
  public getLicensePlate(): string { return this.licensePlate; }
  public getBaseRatePerDay(): number { return this.baseRatePerDay; }
  public getSeatCapacity(): number { return this.seatCapacity; }
  public getTransmission(): 'AUTOMATIC' | 'MANUAL' { return this.transmission; }
  public getFuelType(): string { return this.fuelType; }
  public getStatus(): CarStatus { return this.status; }
  public getImageUrl(): string { return this.imageUrl; }

  public setBaseRatePerDay(rate: number): void {
    if (rate <= 0) {
      throw new Error('Tarif sewa dasar per hari harus lebih besar dari Rp 0.');
    }
    this.baseRatePerDay = rate;
  }

  public setStatus(status: CarStatus): void {
    this.status = status;
  }

  // Implementasi ITrackable (Live GPS Tracking)
  public updateLocation(lat: number, lng: number, speedKmh: number = 0): void {
    this.gpsCoordinate.setCoordinates(lat, lng);
    this.gpsCoordinate.setSpeedKmh(speedKmh);
  }

  public getTrackingTelemetry(): TrackingTelemetry {
    const distanceFromPoolKm = this.gpsCoordinate.distanceToKm(GpsCoordinate.POOL_ORIGIN);
    return {
      carId: this.id,
      licensePlate: this.licensePlate,
      latitude: this.gpsCoordinate.getLatitude(),
      longitude: this.gpsCoordinate.getLongitude(),
      speedKmh: this.gpsCoordinate.getSpeedKmh(),
      lastUpdated: this.gpsCoordinate.getUpdatedAt().toISOString(),
      isOutOfBounds: distanceFromPoolKm > Car.MAX_OPERATIONAL_RADIUS_KM,
      distanceFromPoolKm,
    };
  }

  // Kontrak Polimorfisme: setiap jenis mobil memiliki aturan perhitungan biaya dan asuransi tersendiri
  public abstract getCategory(): CarCategory;
  public abstract getInsuranceFeePerDay(): number;
  public abstract calculateRentalCost(days: number): number;
  public abstract getAiFeatureDescription(): string;
}

/**
 * 1. Subclass CityCar (Mobil perkotaan irit BBM, cocok untuk 2-4 penumpang)
 */
export class CityCar extends Car {
  public override getCategory(): CarCategory {
    return 'CITY_CAR';
  }

  public override getInsuranceFeePerDay(): number {
    return 25000; // Asuransi ringan Rp 25.000/hari
  }

  public override calculateRentalCost(days: number): number {
    if (days <= 0) throw new Error('Durasi sewa minimal 1 hari.');
    const dailyWithInsurance = this.baseRatePerDay + this.getInsuranceFeePerDay();
    return dailyWithInsurance * days;
  }

  public override getAiFeatureDescription(): string {
    return `City Car lincah & hemat BBM (${this.seatCapacity} kursi, transmisi ${this.transmission}), cocok untuk mobilitas dalam kota atau pasangan.`;
  }
}

/**
 * 2. Subclass FamilyCar (MPV / SUV keluarga dengan kursi baris ke-3 & bagasi luas)
 */
export class FamilyCar extends Car {
  private hasThirdRowSeat: boolean;
  private luggageLiters: number;

  constructor(props: BaseCarProps & { hasThirdRowSeat?: boolean; luggageLiters?: number }) {
    super(props);
    this.hasThirdRowSeat = props.hasThirdRowSeat ?? true;
    this.luggageLiters = props.luggageLiters ?? 450;
  }

  public override getCategory(): CarCategory {
    return 'FAMILY_CAR';
  }

  public override getInsuranceFeePerDay(): number {
    return 45000; // Asuransi keluarga komprehensif Rp 45.000/hari
  }

  public override calculateRentalCost(days: number): number {
    if (days <= 0) throw new Error('Durasi sewa minimal 1 hari.');
    const baseTotal = (this.baseRatePerDay + this.getInsuranceFeePerDay()) * days;
    return baseTotal;
  }

  public override getAiFeatureDescription(): string {
    return `MPV/SUV Keluarga (${this.seatCapacity} kursi, bagasi ${this.luggageLiters}L, ${
      this.hasThirdRowSeat ? '3 baris kursi' : '2 baris kursi'
    }), sangat ideal untuk liburan keluarga luar kota.`;
  }
}

/**
 * 3. Subclass LuxuryCar (Mobil premium/eksekutif dengan proteksi All-Risk & opsi sopir)
 */
export class LuxuryCar extends Car {
  private chauffeurIncluded: boolean;
  private securityDeposit: number;

  constructor(props: BaseCarProps & { chauffeurIncluded?: boolean; securityDeposit?: number }) {
    super(props);
    this.chauffeurIncluded = props.chauffeurIncluded ?? true;
    this.securityDeposit = props.securityDeposit ?? 2000000;
  }

  public getSecurityDeposit(): number {
    return this.securityDeposit;
  }

  public override getCategory(): CarCategory {
    return 'LUXURY_CAR';
  }

  public override getInsuranceFeePerDay(): number {
    return Math.round(this.baseRatePerDay * 0.1); // Proteksi VIP All-Risk 10% dari tarif dasar
  }

  public override calculateRentalCost(days: number): number {
    if (days <= 0) throw new Error('Durasi sewa minimal 1 hari.');
    const chauffeurFeePerDay = this.chauffeurIncluded ? 250000 : 0;
    return (this.baseRatePerDay + this.getInsuranceFeePerDay() + chauffeurFeePerDay) * days;
  }

  public override getAiFeatureDescription(): string {
    return `Luxury Class (${this.seatCapacity} kursi, ${
      this.chauffeurIncluded ? 'termasuk sopir profesional' : 'lepas kunci'
    }), cocok untuk perjalanan bisnis VIP atau acara pernikahan.`;
  }
}

/**
 * 4. Subclass ElectricCar (Mobil listrik ramah lingkungan dengan insentif potongan ramah lingkungan)
 */
export class ElectricCar extends Car {
  private batteryCapacityKwh: number;
  private rangeKm: number;

  constructor(props: BaseCarProps & { batteryCapacityKwh?: number; rangeKm?: number }) {
    super({ ...props, fuelType: 'ELECTRIC' });
    this.batteryCapacityKwh = props.batteryCapacityKwh ?? 60;
    this.rangeKm = props.rangeKm ?? 400;
  }

  public getRangeKm(): number {
    return this.rangeKm;
  }

  public override getCategory(): CarCategory {
    return 'ELECTRIC_CAR';
  }

  public override getInsuranceFeePerDay(): number {
    return 50000; // Proteksi baterai & kelistrikan EV
  }

  public override calculateRentalCost(days: number): number {
    if (days <= 0) throw new Error('Durasi sewa minimal 1 hari.');
    // Insentif Eco-Green: potongan Rp 30.000/hari untuk penggunaan kendaraan bebas emisi
    const ecoIncentivePerDay = 30000;
    return (this.baseRatePerDay + this.getInsuranceFeePerDay() - ecoIncentivePerDay) * days;
  }

  public override getAiFeatureDescription(): string {
    return `Mobil Listrik EV (Baterai ${this.batteryCapacityKwh} kWh, jarak tempuh ${this.rangeKm} km sekali cas, bebas ganjil-genap & bebas emisi).`;
  }
}

/**
 * Factory Class untuk mengubah baris database Supabase menjadi instance subclass Car yang tepat
 */
export class CarFactory {
  public static fromDatabaseRow(row: any): Car {
    const baseProps: BaseCarProps = {
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: Number(row.year),
      licensePlate: row.licensePlate ?? row.license_plate,
      baseRatePerDay: Number(row.baseRatePerDay ?? row.base_rate_per_day),
      seatCapacity: Number(row.seatCapacity ?? row.seat_capacity),
      transmission: row.transmission,
      fuelType: row.fuelType ?? row.fuel_type,
      status: row.status,
      imageUrl: row.imageUrl ?? row.image_url,
      gpsCoordinate: new GpsCoordinate(
        Number(row.latitude ?? -7.2575),
        Number(row.longitude ?? 112.7521),
        Number(row.speedKmh ?? row.speed_kmh ?? 0),
        row.lastGpsPing ? new Date(row.lastGpsPing) : new Date()
      ),
    };

    switch (row.category as CarCategory) {
      case 'FAMILY_CAR':
        return new FamilyCar({
          ...baseProps,
          hasThirdRowSeat: Boolean(row.hasThirdRowSeat ?? row.has_third_row_seat ?? true),
          luggageLiters: Number(row.luggageLiters ?? row.luggage_liters ?? 450),
        });
      case 'LUXURY_CAR':
        return new LuxuryCar({
          ...baseProps,
          chauffeurIncluded: Boolean(row.chauffeurIncluded ?? row.chauffeur_included ?? true),
          securityDeposit: Number(row.securityDeposit ?? row.security_deposit ?? 2000000),
        });
      case 'ELECTRIC_CAR':
        return new ElectricCar({
          ...baseProps,
          batteryCapacityKwh: Number(row.batteryCapacityKwh ?? row.battery_capacity_kwh ?? 60),
          rangeKm: Number(row.rangeKm ?? row.range_km ?? 400),
        });
      case 'CITY_CAR':
      default:
        return new CityCar(baseProps);
    }
  }
}