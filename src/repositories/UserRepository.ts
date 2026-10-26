import { User } from '@/domain/models/User';
import { IRepository, MembershipTier, UserRole } from '@/domain/interfaces';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const IN_MEMORY_USERS: User[] = [
  new User(
    'usr-1',
    'Bagas Bintang (Penyewa)',
    'bintang@yukjalan.id',
    'CUSTOMER',
    'GOLD',
    '081234567890',
    'customer123'
  ),
  new User(
    'usr-admin',
    'Admin Host YukJalan',
    'admin@yukjalan.id',
    'ADMIN',
    'PLATINUM',
    '081199998888',
    'admin123'
  )
];

export class UserRepository implements IRepository<User> {
  async findAll(): Promise<User[]> {
    if (!isSupabaseConfigured()) return IN_MEMORY_USERS;

    const { data, error } = await supabase.from('users').select('*');
    if (error || !data || data.length === 0) return IN_MEMORY_USERS;

    return data.map(
      (u) =>
        new User(
          u.id,
          u.name,
          u.email,
          (u.role as UserRole) || 'CUSTOMER',
          (u.membership_tier as MembershipTier) || 'SILVER'
        )
    );
  }

  async findById(id: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find((u) => u.id === id) || IN_MEMORY_USERS[0];
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const clean = identifier.trim().toLowerCase();
    const foundLocal = IN_MEMORY_USERS.find(
      (u) => u.email.toLowerCase() === clean || u.phone === clean
    );
    if (foundLocal) return foundLocal;

    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .ilike('email', clean)
        .maybeSingle();

      if (data) {
        return new User(
          data.id,
          data.name,
          data.email,
          data.role as UserRole,
          data.membership_tier as MembershipTier
        );
      }
    }
    return null;
  }

  async create(params: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    const tier: MembershipTier = params.role === 'ADMIN' ? 'PLATINUM' : 'GOLD';
    const newUser = new User(
      `usr-${Date.now()}`,
      params.name,
      params.email.toLowerCase(),
      params.role,
      tier,
      params.phone,
      params.password
    );

    IN_MEMORY_USERS.push(newUser);

    if (isSupabaseConfigured()) {
      await supabase.from('users').insert({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        membership_tier: newUser.membershipTier
      });
    }

    return newUser;
  }
}