// src/domain/models/Booking.ts
import { IPaymentGateway, PaymentReceipt } from '../interfaces';
import { Car } from './Car';
import { Customer as CustomerModel } from './User';

/**
 * Class Booking menunjukkan pilar Composition:
 * Mengomposisikan objek Customer, Car, dan IPaymentGateway.
 */
export class Booking {
  private readonly id: string;
  private readonly customer: CustomerModel;
  private readonly car: Car;
  private readonly paymentGateway: IPaymentGateway;
  private readonly startDate: Date;
  private readonly endDate: Date;
  private status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

  constructor(
    id: string,
    customer: CustomerModel,
    car: Car,
    paymentGateway: IPaymentGateway,
    startDate: Date,
    endDate: Date
  ) {
    if (endDate <= startDate) {
      throw new Error('Tanggal selesai sewa harus setelah tanggal mulai sewa.');
    }
    if (car.getStatus() !== 'AVAILABLE') {
      throw new Error(`Mobil ${car.getFullName()} sedang tidak tersedia (${car.getStatus()}).`);
    }
    this.id = id;
    this.customer = customer;
    this.car = car;
    this.paymentGateway = paymentGateway;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = 'PENDING';
  }

  public getId(): string { return this.id; }
  public getCustomer(): CustomerModel { return this.customer; }
  public getCar(): Car { return this.car; }
  public getStartDate(): Date { return this.startDate; }
  public getEndDate(): Date { return this.endDate; }
  public getStatus(): string { return this.status; }

  public getTotalDays(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Menggabungkan polimorfisme Car.calculateRentalCost() dan Customer.calculateDiscountedPrice()
   */
  public calculateInvoiceBreakdown(): {
    totalDays: number;
    grossAmount: number;
    discountAmount: number;
    netAmount: number;
    membershipTier: string;
    paymentProvider: string;
  } {
    const totalDays = this.getTotalDays();
    const grossAmount = this.car.calculateRentalCost(totalDays);
    const pricing = this.customer.calculateDiscountedPrice(grossAmount, totalDays);

    return {
      totalDays,
      grossAmount: pricing.grossAmount,
      discountAmount: pricing.discountAmount,
      netAmount: pricing.netAmount,
      membershipTier: pricing.appliedTier,
      paymentProvider: this.paymentGateway.getProviderName(),
    };
  }

  /**
   * Mengeksekusi pembayaran polimorfik dan mengubah state mobil menjadi RENTED
   */
  public async checkout(): Promise<PaymentReceipt> {
    const breakdown = this.calculateInvoiceBreakdown();
    const receipt = await this.paymentGateway.processPayment(breakdown.netAmount, this.id);

    if (receipt.status === 'PAID') {
      this.status = 'ACTIVE';
      this.car.setStatus('RENTED');
      this.customer.addLoyaltyPoints(Math.floor(breakdown.netAmount / 100000) * 10);
    }
    return receipt;
  }
}