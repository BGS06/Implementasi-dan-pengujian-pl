// src/services/AICarAdvisorService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIRecommendationResult,
  CarRecommendationItem,
  IAIAdvisor,
  IMembershipStrategy,
} from '../domain/interfaces';
import { CarRepository } from '../repositories/CarRepository';
import { prisma } from '../lib/supabase';

/**
 * Class AICarAdvisorService (Mengimplementasikan kontrak IAIAdvisor)
 * Mengintegrasikan Gemini AI dengan model OOP Car dan Membership untuk memberikan
 * rekomendasi armada yang akurat beserta simulasi diskon otomatis.
 */
export class AICarAdvisorService implements IAIAdvisor {
  private readonly carRepository: CarRepository;
  private readonly genAI: GoogleGenerativeAI | null;

  constructor(carRepository: CarRepository = new CarRepository()) {
    this.carRepository = carRepository;
    const apiKey = process.env.GEMINI_API_KEY;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  public async recommendCars(
    userPrompt: string,
    rentalDays: number = 1,
    membership: IMembershipStrategy,
    userId?: string
  ): Promise<AIRecommendationResult> {
    const availableCars = await this.carRepository.findAll(true);
    const safeDays = Math.max(1, rentalDays);

    // Hitung simulasi harga polimorfik & diskon membership untuk setiap mobil yang tersedia
    const catalogContext = availableCars.map((car) => {
      const grossCost = car.calculateRentalCost(safeDays);
      const discountAmount = membership.calculateDiscountAmount(grossCost, safeDays);
      const estimatedNetCost = grossCost - discountAmount;

      return {
        carId: car.getId(),
        brandModel: car.getFullName(),
        category: car.getCategory(),
        seatCapacity: car.getSeatCapacity(),
        transmission: car.getTransmission(),
        fuelType: car.getFuelType(),
        grossCost,
        discountAmount,
        estimatedNetCost,
        featureSummary: car.getAiFeatureDescription(),
      };
    });

    if (!this.genAI) {
      throw new Error('Konfigurasi GEMINI_API_KEY belum diatur pada environment server.');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const systemInstruction = `
Kamu adalah "RentPod AI Smart Car Advisor", asisten konsultan penyewaan mobil pintar.
Tugasmu adalah menganalisis kebutuhan pelanggan dalam bahasa sehari-hari, lalu memilih maksimal 3 mobil terbaik yang TERSEDIA di katalog database di bawah ini.

Konteks Pelanggan:
- Tier Membership: ${membership.getTierName()} (Diskon otomatis sudah dihitung pada field estimatedNetCost)
- Durasi Sewa Default: ${safeDays} hari (jika pengguna menyebut jumlah hari berbeda di prompt, gunakan proporsi yang sesuai)

Data Katalog Mobil Tersedia (JSON):
${JSON.stringify(catalogContext, null, 2)}

Kembalikan respons HANYA dalam format JSON valid dengan struktur berikut:
{
  "summaryMessage": "Penjelasan ramah dalam bahasa Indonesia mengenai rekomendasi mobil dan rincian penghematan member",
  "extractedCriteria": {
    "passengers": number | null,
    "durationDays": number,
    "maxBudget": number | null,
    "preferredCategory": string | null
  },
  "recommendations": [
    {
      "carId": "uuid dari katalog",
      "brandModel": "nama mobil",
      "category": "CITY_CAR | FAMILY_CAR | LUXURY_CAR | ELECTRIC_CAR",
      "seatCapacity": number,
      "grossCost": number,
      "discountAmount": number,
      "estimatedNetCost": number,
      "matchScore": number (skala 1-100),
      "reasoning": "Alasan spesifik kenapa mobil ini cocok dengan kebutuhan dan budget user"
    }
  ]
}`;

    const response = await model.generateContent([
      { text: systemInstruction },
      { text: `Permintaan Pelanggan: "${userPrompt}"` },
    ]);

    const parsed: AIRecommendationResult = JSON.parse(response.response.text());

    // Simpan riwayat konsultasi AI ke Supabase
    await prisma.aiChatLog.create({
      data: {
        userId: userId ?? null,
        userPrompt,
        aiResponseSummary: parsed.summaryMessage,
        recommendedCarIds: parsed.recommendations.map((r: CarRecommendationItem) => r.carId),
      },
    });

    return parsed;
  }
}