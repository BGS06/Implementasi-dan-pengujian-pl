export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER',
    public membershipTier: string = 'REGULAR',
    public phone: string = '081234567890',
    private passwordHash: string = ''
  ) {}

  public verifyPassword(inputPassword: string): boolean {
    return this.passwordHash === inputPassword;
  }
}