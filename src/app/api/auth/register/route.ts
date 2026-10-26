import { NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { UserRole } from '@/domain/interfaces';

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role: UserRole = body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    const user = await authService.register({
      name: body.name || 'Member YukJalan',
      email: body.email,
      phone: body.phone || '-',
      password: body.password || '123456',
      role
    });

    return NextResponse.json(
      {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          membershipTier: user.membershipTier
        }
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mendaftarkan akun';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}