import { MembershipTier } from '../interfaces';

export class Membership {
  constructor(
    public readonly tier: MembershipTier,
    public readonly discountRate: number
  ) {}

  public static fromTier(tier: MembershipTier): Membership {
    switch (tier) {
      case 'PLATINUM':
        return new Membership('PLATINUM', 0.15);
      case 'GOLD':
        return new Membership('GOLD', 0.10);
      default:
        return new Membership('SILVER', 0.0);
    }
  }

  public applyDiscount(amount: number): number {
    return Math.round(amount * (1 - this.discountRate));
  }
}