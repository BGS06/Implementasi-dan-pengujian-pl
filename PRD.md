Tolong buatkan aplikasi web Full-Stack Rental Mobil berbasis Next.js (App Router) dan TypeScript dengan menerapkan paradigma Object-Oriented Programming (OOP) secara ketat serta integrasi fitur AI.

1. Arsitektur & Struktur Folder (Clean OOP Architecture di Next.js):
   - src/domain/models/: Berisi abstract class dan concrete class untuk entitas utama.
   - src/domain/interfaces/: Berisi kontrak interface (misalnya IPaymentGateway, IDiscountStrategy, IAIService).
   - src/repositories/: Class repository untuk abstraksi akses database (menggunakan PostgreSQL di Supabase).
   - src/services/: Class business logic (BookingService, AuthService, AIService).
   - src/app/api/: Next.js Route Handlers yang memanggil instance dari Service class.
   - src/app/: Halaman UI untuk Customer dan Admin menggunakan Tailwind CSS.

2. Penerapan 4 Pilar OOP di TypeScript:
   - Inheritance (Pewarisan):
     * Abstract class `User` (properti protected/private: id, name, email, passwordHash) yang diturunkan menjadi class `Admin` dan `Customer`.
     * Abstract class `Car` (id, brand, model, baseRatePerDay, status) yang diturunkan menjadi subclass seperti `FamilyCar` (MPV/SUV), `CityCar`, dan `LuxuryCar` atau `ElectricCar` dengan aturan biaya tambahan/asuransi masing-masing.
   - Polymorphism (Polimorfisme):
     * Interface/Abstract class `PaymentMethod` dengan method `processPayment(amount: number)` yang diimplementasikan secara polimorfik oleh class `BankTransferPayment`, `QrisPayment`, dan `EWalletPayment`.
     * Method `calculateTotalCost()` pada class turunan `Car` atau `Membership` yang menghasilkan perhitungan tarif berbeda sesuai tipe mobil dan level member.
   - Encapsulation (Enkapsulasi):
     * Penggunaan access modifier `private`, `protected`, dan `public` secara disiplin pada setiap model dan DTO, lengkap dengan getter/setter dan validasi state internal.
   - Composition & Abstraction:
     * Class `Customer` memiliki komposisi objek `Membership` (`RegularMembership` vs `VipMembership`) yang menentukan diskon otomatis.
     * Class `Booking` mengomposisikan objek `Customer`, `Car`, dan `PaymentMethod`.

3. Fitur AI yang Diintegrasikan:
   - Smart AI Car Advisor (Chatbot & Rekomendasi Mobil): Menggunakan class `AICarAdvisorService` (mengimplementasikan interface `IAIAdvisor`) yang terhubung ke Gemini API / OpenAI API.
   - User dapat memasukkan kebutuhan dalam bahasa sehari-hari (contoh: "Saya butuh mobil irit untuk liburan keluarga 6 orang di Malang selama 3 hari dengan budget maksimal 1,5 juta"), lalu AI akan menganalisis ketersediaan mobil di database, menghitung estimasi biaya beserta diskon membership, dan memberikan rekomendasi mobil terbaik.

4. Fitur Utama Aplikasi:
   - Autentikasi berbasis Role (Admin & Customer) dengan password hashing (bcrypt).
   - Dashboard Customer: Katalog mobil, filter pencarian, AI Car Advisor, simulasi harga & diskon VIP/Regular, booking mobil, dan riwayat transaksi.
   - Dashboard Admin: CRUD armada mobil, pemantauan status sewa/pengembalian, dan laporan pendapatan.

Tolong mulai dengan membuatkan:
1. Class Diagram (Mermaid) dan skema database (Prisma schema).
2. Implementasi kode lengkap untuk layer OOP (`src/domain/`, `src/repositories/`, dan `src/services/` termasuk integrasi AI).
3. Implementasi API Routes dan komponen UI utama di Next.js.