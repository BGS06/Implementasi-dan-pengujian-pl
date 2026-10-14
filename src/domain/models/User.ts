// src/domain/models/User.ts
import bcrypt from 'bcryptjs';
import { IMembershipStrategy, UserRole } from '../interfaces';
import { MembershipFactory, VipMembership } from './Membership';

/**
 * Abstract Class User (Pilar Inheritance & Encapsulation)
 */
export abstract class User {
  protected readonly id: string;
  protected name: string;
  protected email: string;
  private passwordHash: string;
  protected readonly role: UserRole;

  constructor(id: string, name: string, email: string, passwordHash: string, role: UserRole) {
    this.id = id;
    this.setName(name);
    this.setEmail(email);
    this.passwordHash = passwordHash;
    this.role = role;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Nama pengguna minimal harus terdiri dari 2 karakter.');
    }
    this.name = name.trim();
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Format email tidak valid: ${email}`);
    }
    this.email = email.toLowerCase();
  }

  public getRole(): UserRole {
    return this.role;
  }

  /**
   * Enkapsulasi verifikasi password menggunakan bcrypt (seperti jBCrypt di RentPod Java)
   */
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.passwordHash);
  }

  public static async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  }

  // Abstract methods yang wajib diimplementasikan oleh subclass (Admin & Customer)
  public abstract getDashboardRoute(): string;
  public abstract getPermissions(): string[];
}

/**
 * Subclass Admin (Pewarisan dari User)
 */
export class Admin extends User {
  private department: string;

  constructor(
    id: string,
    name: string,
    email: string,
    passwordHash: string,
    department: string = 'Fleet & Operations'
  ) {
    super(id, name, email, passwordHash, 'ADMIN');
    this.department = department;
  }

  public getDepartment(): string {
    return this.department;
  }

  public override getDashboardRoute(): string {
    return '/dashboard/admin';
  }

  public override getPermissions(): string[] {
    return [
      'MANAGE_CARS',
      'VIEW_LIVE_GPS',
      'MANAGE_BOOKINGS',
      'VIEW_FINANCIAL_REPORTS'
    ];
  }
}

/**
 * Subclass Customer (Pewarisan dari User + Komposisi dengan IMembershipStrategy)
 */
export class Customer extends User {
  private driverLicenseNumber: string;
  private membership: IMembershipStrategy;
  private loyaltyPoints: number;

  constructor(
    id: string,
    name: string,
    email: string,
    passwordHash: string,
    driverLicenseNumber: string,
    membership: IMembershipStrategy = MembershipFactory.create('REGULAR'),
    loyaltyPoints: number = 0
  ) {
    super(id, name, email, passwordHash, 'CUSTOMER');
    this.driverLicenseNumber = driverLicenseNumber;
    this.membership = membership;
    this.loyaltyPoints = Math.max(0, loyaltyPoints);
  }

  public getDriverLicenseNumber(): string {
    return this.driverLicenseNumber;
  }

  public getMembership(): IMembershipStrategy {
    return this.membership;
  }

  public upgradeToVip(): void {
    this.membership = new VipMembership();
  }

  public getLoyaltyPoints(): number {
    return this.loyaltyPoints;
  }

  public addLoyaltyPoints(points: number): void {
    if (points > 0) {
      this.loyaltyPoints += points;
    }
  }

  /**
   * Menghitung harga bersih setelah diskon membership
   */
  public calculateDiscountedPrice(grossAmount: number, rentalDays: number): {
    grossAmount: number;
    discountAmount: number;
    netAmount: number;
    appliedTier: string;
  } {
    const discountAmount = this.membership.calculateDiscountAmount(grossAmount, rentalDays);
    return {
      grossAmount,
      discountAmount,
      netAmount: grossAmount - discountAmount,
      appliedTier: this.membership.getTierName(),
    };
  }

  public override getDashboardRoute(): string {
    return '/dashboard/customer';
  }

  public override getPermissions(): string[] {
    return ['BROWSE_CARS', 'CREATE_BOOKING', 'USE_AI_ADVISOR', 'VIEW_OWN_HISTORY'];
  }
}