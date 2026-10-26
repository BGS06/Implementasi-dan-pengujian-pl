import { UserRepository } from '@/repositories/UserRepository';
import { User } from '@/domain/models/User';
import { UserRole } from '@/domain/interfaces';

export class AuthService {
  private userRepo = new UserRepository();

  async login(identifier: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmailOrPhone(identifier);
    if (!user) {
      throw new Error('Akun tidak ditemukan. Silakan periksa email/nomor HP atau daftar baru.');
    }
    if (!user.verifyPassword(password)) {
      throw new Error('Password yang Anda masukkan salah.');
    }
    return user;
  }

  async register(params: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    const existing = await this.userRepo.findByEmailOrPhone(params.email);
    if (existing) {
      throw new Error('Email sudah terdaftar. Silakan langsung masuk.');
    }
    return this.userRepo.create(params);
  }
}