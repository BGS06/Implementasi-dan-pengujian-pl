import { CarRepository } from '@/repositories/CarRepository';

export class AICarAdvisorService {
  private carRepo = new CarRepository();

  async getRecommendation(prompt: string): Promise<string> {
    const cars = await this.carRepo.findAll();
    const query = prompt.toLowerCase();

    if (query.includes('keluarga') || query.includes('7') || query.includes('ramai') || query.includes('besar')) {
      const mpv = cars.find((c) => c.category === 'MPV' || c.seats >= 7);
      return `Untuk perjalanan bersama keluarga atau rombongan, saya sangat merekomendasikan **${mpv?.fullName}** (${mpv?.seats} kursi) dengan tarif Rp ${mpv?.pricePerDay.toLocaleString('id-ID')}/hari. Kabinnya luas dan hemat bahan bakar.`;
    }

    if (query.includes('listrik') || query.includes('ev') || query.includes('hemat') || query.includes('kota')) {
      const ev = cars.find((c) => c.category === 'EV');
      return `Untuk berkendara modern dan bebas emisi di dalam kota, **${ev?.fullName}** adalah pilihan terbaik dengan tarif Rp ${ev?.pricePerDay.toLocaleString('id-ID')}/hari.`;
    }

    if (query.includes('gunung') || query.includes('tanjakan') || query.includes('bandung') || query.includes('suv')) {
      const suv = cars.find((c) => c.category === 'SUV');
      return `Untuk medan menanjak atau perjalanan luar kota, **${suv?.fullName}** (SUV) sangat tangguh dengan tarif Rp ${suv?.pricePerDay.toLocaleString('id-ID')}/hari.`;
    }

    const listText = cars
      .map((c) => `• ${c.fullName} (${c.category}, ${c.seats} kursi) - Rp ${c.pricePerDay.toLocaleString('id-ID')}/hari`)
      .join('\n');

    return `Berikut daftar armada YukJalan yang siap disewa:\n${listText}\n\nSebutkan kebutuhan Anda (misal: "mobil keluarga 7 kursi" atau "mobil listrik dalam kota") agar saya dapat memilihkan unit terbaik!`;
  }
}