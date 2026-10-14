// src/services/BookingService.ts
import { randomUUID } from 'crypto';
import { prisma } from '../lib/supabase';
import { CarRepository } from '../repositories/CarRepository';
import { Booking } from '../domain/models/Booking';
import { Customer } from '../domain/models/User';
import { MembershipFactory } from '../domain/models/Membership';
import { PaymentFactory } from '../domain/models/Payment';
import { PaymentType } from '../domain/interfaces';

export interface CreateBookingDto {
  customerId: string;
  carId: string;
  startDate: string;
  endDate: string;
  paymentType: PaymentType;
  paymentProviderOption: string;
  customerPhone?: string;
}

export class BookingService {
  private readonly carRepository: CarRepository;

  constructor(carRepository: CarRepository = new CarRepository()) {
    this.carRepository = carRepository;
  }

  public async createBooking(dto: CreateBookingDto) {
    const userRow = await prisma.user.findUnique({ where: { id: dto.customerId } });
    if (!userRow || userRow.role !== 'CUSTOMER') {
      throw new Error('Data pelanggan tidak ditemukan atau tidak valid.');
    }

    const car = await this.carRepository.findById(dto.carId);
    if (!car) {
      throw new Error('Armada mobil tidak ditemukan.');
    }

    // Rekonstruksi objek OOP Customer beserta komposisi Membership-nya
    const membership = MembershipFactory.create(userRow.membershipTier);
    const customer = new Customer(
      userRow.id,
      userRow.name,
      userRow.email,
      userRow.passwordHash,
      userRow.driverLicenseNumber ?? '-',
      membership,
      userRow.loyaltyPoints
    );

    // Instansiasi PaymentMethod secara polimorfik via PaymentFactory
    const paymentGateway = PaymentFactory.create(
      dto.paymentType,
      dto.paymentProviderOption,
      dto.customerPhone
    );

    // Komposisi objek Booking
    const bookingId = randomUUID();
    const bookingDomain = new Booking(
      bookingId,
      customer,
      car,
      paymentGateway,
      new Date(dto.startDate),
      new Date(dto.endDate)
    );

    const breakdown = bookingDomain.calculateInvoiceBreakdown();
    const receipt = await bookingDomain.checkout();

    // Simpan transaksi secara atomik ke Supabase PostgreSQL
    const savedBooking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          id: bookingId,
          customerId: customer.getId(),
          carId: car.getId(),
          startDate: bookingDomain.getStartDate(),
          endDate: bookingDomain.getEndDate(),
          totalDays: breakdown.totalDays,
          grossAmount: breakdown.grossAmount,
          discountAmount: breakdown.discountAmount,
          netAmount: breakdown.netAmount,
          status: 'ACTIVE',
          payment: {
            create: {
              paymentType: dto.paymentType,
              amount: breakdown.netAmount,
              status: 'PAID',
              providerName: receipt.provider,
              paymentReference: receipt.paymentCodeOrQr,
              paidAt: new Date(),
            },
          },
        },
        include: { payment: true, car: true },
      });

      await tx.car.update({
        where: { id: car.getId() },
        data: { status: 'RENTED' },
      });

      await tx.user.update({
        where: { id: customer.getId() },
        data: { loyaltyPoints: customer.getLoyaltyPoints() },
      });

      return created;
    });

    return {
      booking: savedBooking,
      invoiceBreakdown: breakdown,
      paymentReceipt: receipt,
    };
  }
}