'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LiveGpsTrackerMap from '@/components/LiveGpsTrackerMap';
import { SessionUser } from '@/components/Navbar';

interface CarItem {
  id: string;
  brand: string;
  model: string;
  plateNumber: string;
  category: string;
  seats: number;
  pricePerDay: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  imageUrl: string;
}

interface BookingItem {
  id: string;
  userId: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<SessionUser | null>(null);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  // Form tambah mobil baru
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [category, setCategory] = useState('MPV');
  const [seats, setSeats] = useState(7);
  const [pricePerDay, setPricePerDay] = useState(650000);
  const [imageUrl, setImageUrl] = useState('');

  const loadData = async () => {
    const [carRes, bookRes] = await Promise.all([fetch('/api/cars'), fetch('/api/bookings')]);
    const carJson = await carRes.json();
    const bookJson = await bookRes.json();
    if (carJson.data) setCars(carJson.data);
    if (bookJson.data) setBookings(bookJson.data);
  };

  useEffect(() => {
    const raw = localStorage.getItem('yukjalan_user');
    if (!raw) {
      router.push('/login');
      return;
    }
    const parsed: SessionUser = JSON.parse(raw);
    if (parsed.role !== 'ADMIN') {
      router.push('/dashboard/customer');
      return;
    }
    setAdminUser(parsed);
    loadData();
  }, [router]);

  const handleUpdateBooking = async (id: string, status: BookingItem['status']) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    loadData();
  };

  const handleUpdateCarStatus = async (id: string, status: CarItem['status']) => {
    await fetch('/api/cars', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    loadData();
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand,
        model,
        plateNumber,
        category,
        seats,
        pricePerDay,
        imageUrl
      })
    });
    setBrand('');
    setModel('');
    setPlateNumber('');
    setImageUrl('');
    loadData();
  };

  const totalRevenue = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((acc, cur) => acc + cur.totalPrice, 0);

  if (!adminUser) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Banner Header Admin */}
      <div
        style={{
          background: 'linear-gradient(125deg, #0f2926 0%, #115e59 100%)',
          color: '#fff',
          padding: 28,
          borderRadius: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <span
            style={{
              background: '#00a896',
              padding: '5px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800
            }}
          >
            🛠️ PANEL KONTROL ADMIN HOST
          </span>
          <h2 style={{ margin: '12px 0 4px', fontSize: 28 }}>Selamat Bertugas, {adminUser.name}</h2>
          <p style={{ margin: 0, color: '#ccfbf1', fontSize: 14 }}>
            Kelola ketersediaan unit kendaraan, verifikasi pesanan penyewa, dan pantau telemetri GPS.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 20px', borderRadius: 16 }}>
            <div style={{ fontSize: 12, color: '#99f6e4' }}>Total Pendapatan Aktif</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Rp {totalRevenue.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 20px', borderRadius: 16 }}>
            <div style={{ fontSize: 12, color: '#99f6e4' }}>Total Armada / Pesanan</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {cars.length} Unit • {bookings.length} Order
            </div>
          </div>
        </div>
      </div>

      {/* Manajemen Pesanan Penyewa */}
      <div className="bobo-panel">
        <h3 style={{ marginTop: 0, fontSize: 20, fontWeight: 800 }}>📋 Koordinasi & Verifikasi Pesanan Penyewa</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                padding: 16,
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0f2926' }}>
                  {b.carName} <span style={{ fontSize: 12, color: '#64748b' }}>({b.id})</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  Penyewa ID: <strong>{b.userId}</strong> • Jadwal: {b.startDate} s/d {b.endDate} ({b.totalDays} hari)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <strong style={{ color: '#007f71', fontSize: 16 }}>
                  Rp {b.totalPrice.toLocaleString('id-ID')}
                </strong>
                <select
                  value={b.status}
                  onChange={(e) => handleUpdateBooking(b.id, e.target.value as BookingItem['status'])}
                  className="bobo-select"
                  style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manajemen Armada & Form Tambah Unit */}
      <div className="bobo-split-grid">
        <div className="bobo-panel">
          <h3 style={{ marginTop: 0, fontSize: 19, fontWeight: 800 }}>🚗 Status Operasional Armada</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cars.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={c.imageUrl}
                    alt={c.model}
                    style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>
                      {c.brand} {c.model}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {c.plateNumber} • Rp {c.pricePerDay.toLocaleString('id-ID')}/hari
                    </div>
                  </div>
                </div>

                <select
                  value={c.status}
                  onChange={(e) => handleUpdateCarStatus(c.id, e.target.value as CarItem['status'])}
                  className="bobo-select"
                  style={{ width: 'auto', padding: '7px 12px', fontSize: 12 }}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RENTED">RENTED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="bobo-panel">
          <h3 style={{ marginTop: 0, fontSize: 19, fontWeight: 800 }}>➕ Tambah Unit Kendaraan Baru</h3>
          <form onSubmit={handleAddCar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                className="bobo-input"
                placeholder="Merek (cth: Toyota)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
              <input
                className="bobo-input"
                placeholder="Model (cth: Raize GR)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <input
                className="bobo-input"
                placeholder="Plat Nomor (D 1234 AB)"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                required
              />
              <select
                className="bobo-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="MPV">MPV</option>
                <option value="SUV">SUV</option>
                <option value="EV">EV</option>
                <option value="SEDAN">SEDAN</option>
              </select>
              <input
                type="number"
                className="bobo-input"
                placeholder="Kursi"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                required
              />
            </div>
            <input
              type="number"
              className="bobo-input"
              placeholder="Harga Sewa per Hari (Rp)"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(Number(e.target.value))}
              required
            />
            <input
              type="url"
              className="bobo-input"
              placeholder="URL Foto Kendaraan (Opsional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <button type="submit" className="bobo-btn-primary">
              Simpan Armada Baru
            </button>
          </form>
        </div>
      </div>

      {/* Live GPS Fleet Tracker untuk Admin */}
      <LiveGpsTrackerMap />
    </div>
  );
}