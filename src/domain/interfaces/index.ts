export type UserRole = 'CUSTOMER' | 'ADMIN';
export type MembershipTier = 'SILVER' | 'GOLD' | 'PLATINUM';
export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
}