import { NextResponse } from 'next/server';
import { UserRepository } from '@/repositories/UserRepository';

const userRepo = new UserRepository();

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    const user = await userRepo.findByEmail(identifier);

    if (!user || !user.verifyPassword(password)) {
      return NextResponse.json({ error: 'Email atau Password salah' }, { status: 401 });
    }

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipTier: user.membershipTier
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}