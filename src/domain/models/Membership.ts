// src/domain/models/Membership.ts
import { IMembershipStrategy, MembershipTier } from '../interfaces';

export abstract class Membership implements IMembershipStrategy {
  protected readonly tierName: MembershipTier;

  constructor(tierName: MembershipTier) {
    this.tierName = tierName;
  }

  public getTierName(): MembershipTier {
    return this.tierName;
  }

  public abstract getDiscountPercentage(rentalDays: number): number;
  public abstract getBenefits(): string[];

  public calculateDiscountAmount(grossAmount: number, rentalDays: number): number {
    const percentage = this.getDiscountPercentage(rentalDays);
    return Math.round(grossAmount * (percentage / 100));
  }
}

export class RegularMembership extends Membership {
  constructor() {
    super('REGULAR');
  }

  // Member Regular mendapat diskon 5% jika menyewa minimal 5 hari
  public override getDiscountPercentage(rentalDays: number): number {
    return rentalDays >= 5 ? 5 : 0;
  }

  public override getBenefits(): string[] {
    return [
      'Asuransi dasar kecelakaan standar',
      'Diskon durasi 5% untuk sewa minimal 5 hari',
      'Bantuan darurat 24/7 via telepon'
    ];
  }
}

export class VipMembership extends Membership {
  constructor() {
    super('VIP');
  }

  // Member VIP mendapat diskon dasar 15%, atau 20% jika sewa >= 5 hari
  public override getDiscountPercentage(rentalDays: number): number {
    return rentalDays >= 5 ? 20 : 15;
  }

  public override getBenefits(): string[] {
    return [
      'Diskon langsung 15% (hingga 20% untuk sewa >= 5 hari)',
      'Bebas biaya antar-jemput mobil dalam kota',
      'Prioritas unit mobil terbaru & penggantian unit instan',
      'Akses penuh AI Trip Concierge'
    ];
  }
}

export class MembershipFactory {
  public static create(tier: MembershipTier): IMembershipStrategy {
    switch (tier) {
      case 'VIP':
        return new VipMembership();
      case 'REGULAR':
      default:
        return new RegularMembership();
    }
  }
}