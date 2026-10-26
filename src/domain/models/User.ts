import { MembershipTier, UserRole } from '../interfaces';
import { Membership } from './Membership';

export class User {
  public readonly membership: Membership;

  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public role: UserRole = 'CUSTOMER',
    public membershipTier: MembershipTier = 'SILVER',
    public phone: string = '081234567890',
    private password: string = 'password123'
  ) {
    this.membership = Membership.fromTier(membershipTier);
  }

  public verifyPassword(inputPassword: string): boolean {
    return this.password === inputPassword;
  }
}