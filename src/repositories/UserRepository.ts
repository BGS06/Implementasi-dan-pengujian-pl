// src/repositories/UserRepository.ts
import { prisma } from '../lib/supabase';
import { Admin, Customer, User } from '../domain/models/User';
import { MembershipFactory } from '../domain/models/Membership';

export class UserRepository {
  public async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  public async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  private mapToDomain(row: any): User {
    if (row.role === 'ADMIN') {
      return new Admin(row.id, row.name, row.email, row.passwordHash, row.department ?? 'Operations');
    }
    const membership = MembershipFactory.create(row.membershipTier);
    return new Customer(
      row.id,
      row.name,
      row.email,
      row.passwordHash,
      row.driverLicenseNumber ?? '-',
      membership,
      row.loyaltyPoints
    );
  }
}