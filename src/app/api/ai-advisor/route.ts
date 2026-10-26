import { NextResponse } from 'next/server';
import { AICarAdvisorService } from '@/services/AICarAdvisorService';

const advisorService = new AICarAdvisorService();

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const reply = await advisorService.getRecommendation(message || '');
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: 'Maaf, layanan AI Advisor sedang sibuk.' },
      { status: 500 }
    );
  }
}