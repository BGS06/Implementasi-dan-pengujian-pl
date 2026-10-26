'use client';

import React, { useEffect, useState } from 'react';
import AICarAdvisorChat from '@/components/AICarAdvisorChat';
import LiveGpsTrackerMap from '@/components/LiveGpsTrackerMap';

interface CarItem {
  id: string;
  brand: string;
  model: string;
  plateNumber: string;
  category: string;
  seats: number;
  transmission: string;
  pricePerDay: number;
  status: string;
  imageUrl: string;
}

export default function HomePage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedCarId, setSelectedCarId] = useState<string>('car-1');
  const [startDate, setStartDate] = useState<string>('2026-10-27');
  const [endDate, setEndDate] = useState<string>('2026-10-29');
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    fetch('/api/cars')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setCars(json.data);
          if (json.data.length > 0) setSelectedCarId(json.data[0].id);
        }
      });
  }, []);

  const filteredCars =
    activeCategory === 'ALL'
      ? cars
      : cars.filter((c) => c.category.toUpperCase() === activeCategory);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Memproses reservasi armada...');

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr-1',
        carId: selectedCarId,
        startDate,
        endDate
      })
    });

    const data = await res.json();
    if (res.ok) {
      setNotification(
        `✅ Reservasi Berhasil! Kode: ${data.data.id} • Total (Diskon Gold Member 10%): Rp ${data.data.totalPrice.toLocaleString('id-ID')}`
      );
    } else {
      setNotification(`❌ Gagal: ${data.error}`);
    }
  };

  return (
    <div>
      {/* Hero Banner ala Bobobox */}
      <section className="bobo-hero">
        <div className="bobo-hero-tag">
          <span>🌲 Pengalaman Perjalanan Nyaman</span>
          <span>•</span>
          <span>Gold Member Diskon 10%</span>
        </div>
        <h1>Temukan Kebebasan Menjelajah Bersama YukJalan RentPod</h1>
        <p>
          Sewa mobil tanpa ribet dengan standar kenyamanan Bobobox. Dilengkapi rekomendasi pintar AI Car Advisor,
          akses nirkunci, dan pelacakan telemetri GPS secara real-time.
        </p>
      </section>

      {/* Floating Check-in / Booking Widget ala Bobobox */}
      <section className="bobo-booking-bar">
        <form onSubmit={handleBooking}>
          <div className="bobo-booking-grid">
            <div className="bobo-field">
              <label>Pilih Unit Kendaraan</label>
              <select
                className="bobo-select"
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
              >
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.model} — Rp {c.pricePerDay.toLocaleString('id-ID')}/hari
                  </option>
                ))}
              </select>
            </div>

            <div className="bobo-field">
              <label>Tanggal Mulai Sewa</label>
              <input
                type="date"
                className="bobo-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="bobo-field">
              <label>Tanggal Selesai</label>
              <input
                type="date"
                className="bobo-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button type="submit" className="bobo-btn-primary">
              Pesan Sekarang
            </button>
          </div>

          {notification && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: 12,
                background: '#e6f6f4',
                color: '#007f71',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              {notification}
            </div>
          )}
        </form>
      </section>

      {/* Katalog Armada dengan Filter Kategori & Foto Kendaraan */}
      <section>
        <div className="bobo-section-header">
          <div>
            <span style={{ color: '#00a896', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              Pilihan Armada Terbaik
            </span>
            <h2 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800 }}>
              Pilih Kendaraan Sesuai Gaya Perjalananmu
            </h2>
          </div>

          <div className="bobo-filter-pills">
            {['ALL', 'MPV', 'EV', 'SUV', 'SEDAN'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`bobo-pill ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat === 'ALL' ? 'Semua Unit' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bobo-car-grid">
          {filteredCars.map((car) => {
            const isSelected = selectedCarId === car.id;
            return (
              <div
                key={car.id}
                className={`bobo-car-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="bobo-car-img-wrap">
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    className="bobo-car-img"
                    loading="lazy"
                  />
                  <span className="bobo-badge-category">{car.category}</span>
                  <span className="bobo-badge-status">● Tersedia</span>
                </div>

                <div className="bobo-car-body">
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    Plat Nomor: {car.plateNumber}
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: 19, fontWeight: 800 }}>
                    {car.brand} {car.model}
                  </h3>

                  <div className="bobo-car-specs">
                    <span className="bobo-spec-item">💺 {car.seats} Kursi</span>
                    <span className="bobo-spec-item">⚙️ {car.transmission}</span>
                    <span className="bobo-spec-item">📍 GPS Aktif</span>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Mulai dari</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#007f71' }}>
                          Rp {car.pricePerDay.toLocaleString('id-ID')}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}> /hari</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCarId(car.id)}
                        style={{
                          padding: '9px 18px',
                          borderRadius: 999,
                          border: isSelected ? 'none' : '1.5px solid #00a896',
                          background: isSelected ? '#00a896' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#007f71',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ Terpilih' : 'Pilih Unit'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Split Section: AI Car Advisor & Live GPS */}
      <div className="bobo-split-grid">
        <AICarAdvisorChat />
        <LiveGpsTrackerMap />
      </div>
    </div>
  );
}