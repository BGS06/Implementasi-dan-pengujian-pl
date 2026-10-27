import { NextResponse } from 'next/server';
import { UserRepository } from '@/repositories/UserRepository';

const userRepo = new UserRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const existing = await userRepo.findByEmail(body.email);
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const newUser = await userRepo.create({
      name: body.name,
      email: body.email,
      password_hash: body.password,
      role: body.role
    });

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}