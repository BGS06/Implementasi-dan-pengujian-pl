// src/services/AuthService.ts
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../domain/models/User';

export class AuthService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  public async authenticate(email: string, plainPassword: string): Promise<{
    user: User;
    redirectUrl: string;
    permissions: string[];
  }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email atau kata sandi salah.');
    }

    const isValid = await user.verifyPassword(plainPassword);
    if (!isValid) {
      throw new Error('Email atau kata sandi salah.');
    }

    return {
      user,
      redirectUrl: user.getDashboardRoute(),
      permissions: user.getPermissions(),
    };
  }
}
