// src/domain/interfaces/index.ts

export type UserRole = 'ADMIN' | 'CUSTOMER';
export type MembershipTier = 'REGULAR' | 'VIP';
export type CarCategory = 'CITY_CAR' | 'FAMILY_CAR' | 'LUXURY_CAR' | 'ELECTRIC_CAR';
export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type PaymentType = 'BANK_TRANSFER' | 'QRIS' | 'EWALLET';

export interface TrackingTelemetry {
  carId: string;
  licensePlate: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  lastUpdated: string;
  isOutOfBounds: boolean;
  distanceFromPoolKm: number;
}

/**
 * Kontrak interface untuk entitas yang dapat dilacak via Live GPS Tracking
 */
export interface ITrackable {
  updateLocation(lat: number, lng: number, speedKmh?: number): void;
  getTrackingTelemetry(): TrackingTelemetry;
}

export interface PaymentReceipt {
  transactionId: string;
  bookingId: string;
  methodName: string;
  provider: string;
  amountPaid: number;
  paymentCodeOrQr: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  timestamp: string;
}

/**
 * Kontrak Polimorfisme untuk berbagai metode pembayaran (Bank Transfer, QRIS, E-Wallet)
 */
export interface IPaymentGateway {
  getPaymentType(): PaymentType;
  getProviderName(): string;
  validatePaymentDetails(): boolean;
  processPayment(amount: number, bookingId: string): Promise<PaymentReceipt>;
}

/**
 * Kontrak Polimorfisme & Composition untuk tier Membership Customer
 */
export interface IMembershipStrategy {
  getTierName(): MembershipTier;
  getDiscountPercentage(rentalDays: number): number;
  calculateDiscountAmount(grossAmount: number, rentalDays: number): number;
  getBenefits(): string[];
}

export interface CarRecommendationItem {
  carId: string;
  brandModel: string;
  category: CarCategory;
  seatCapacity: number;
  grossCost: number;
  discountAmount: number;
  estimatedNetCost: number;
  matchScore: number;
  reasoning: string;
}

export interface AIRecommendationResult {
  summaryMessage: string;
  extractedCriteria: {
    passengers?: number;
    durationDays: number;
    maxBudget?: number;
    preferredCategory?: string;
  };
  recommendations: CarRecommendationItem[];
}

/**
 * Kontrak Abstraksi untuk layanan AI Car Advisor
 */
export interface IAIAdvisor {
  recommendCars(
    userPrompt: string,
    rentalDays: number,
    membership: IMembershipStrategy
  ): Promise<AIRecommendationResult>;
}