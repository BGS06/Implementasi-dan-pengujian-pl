import { User } from '@/domain/models/User';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export class UserRepository {
  private generateId(): string {
    return 'U' + Math.floor(1000 + Math.random() * 9000).toString();
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;

    const { data } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (!data) return null;

    // Ambil tier dari tabel relasi (Mock untuk fallback jika tidak di-join)
    return new User(
      data.id,
      data.name,
      data.email,
      data.role,
      data.role === 'ADMIN' ? 'VIP' : 'REGULAR', 
      '081200000000',
      data.password_hash
    );
  }

  async create(params: { name: string; email: string; password_hash: string; role: 'CUSTOMER' | 'ADMIN' }): Promise<User> {
    const newId = this.generateId();
    
    // 1. Insert ke tabel users parent
    await supabase.from('users').insert({
      id: newId,
      name: params.name,
      email: params.email,
      password_hash: params.password_hash,
      role: params.role
    });

    // 2. Insert ke subclass sesuai UML SQL
    if (params.role === 'CUSTOMER') {
      await supabase.from('customers').insert({
        user_id: newId,
        driver_license_number: `SIM-${newId}-${Date.now()}`,
        membership_id: 'MB001', // Regular Default
        loyalty_points: 0
      });
    } else {
      await supabase.from('admins').insert({
        user_id: newId,
        department: 'Operasional'
      });
    }

    return new User(newId, params.name, params.email, params.role, 'REGULAR', '081200000000', params.password_hash);
  }
}