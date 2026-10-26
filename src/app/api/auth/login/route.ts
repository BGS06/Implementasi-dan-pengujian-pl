import { NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    const user = await authService.login(identifier || '', password || '');

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        membershipTier: user.membershipTier
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal masuk ke akun';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}