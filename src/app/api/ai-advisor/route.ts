// src/app/api/ai-advisor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AICarAdvisorService } from '@/services/AICarAdvisorService';
import { MembershipFactory } from '@/domain/models/Membership';
import { MembershipTier } from '@/domain/interfaces';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, rentalDays = 3, membershipTier = 'REGULAR', userId } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt kebutuhan mobil wajib diisi.' },
        { status: 400 }
      );
    }

    const membership = MembershipFactory.create(membershipTier as MembershipTier);
    const aiAdvisorService = new AICarAdvisorService();
    const result = await aiAdvisorService.recommendCars(prompt, Number(rentalDays), membership, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses rekomendasi AI.' },
      { status: 500 }
    );
  }
}