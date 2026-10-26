'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SessionUser } from '@/components/Navbar';

interface BookingRecord {
  id: string;
  userId: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('yukjalan_user');
    if (!raw) {
      router.push('/login');
      return;
    }
    const parsed: SessionUser = JSON.parse(raw);
    if (parsed.role === 'ADMIN') {
      router.push('/dashboard/admin');
      return;
    }
    setUser(parsed);

    fetch('/api/bookings')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setBookings(json.data);
      });
  }, [router]);

  const toggleCheckIn = (id: string) => {
    setCheckedInIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  if (!user) return null;

  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(125deg, #0f2926 0%, #00a896 100%)',
          color: '#ffffff',
          padding: 28,
          borderRadius: 24,
          marginBottom: 28,
          boxShadow: '0 12px 32px rgba(0, 168, 150, 0.18)',
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
              background: 'rgba(255,255,255,0.2)',
              padding: '5px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700
            }}
          >
            ★ BOBO-PRIVILEGE {user.membershipTier} PENYEWA
          </span>
          <h2 style={{ margin: '12px 0 6px', fontSize: 28 }}>Halo, {user.name} 👋</h2>
          <p style={{ margin: 0, color: '#e6f6f4', fontSize: 14 }}>
            Email: {user.email} • Nikmati diskon member otomatis & kontrol penuh Digital Check-in.
          </p>
        </div>

        <Link
          href="/"
          style={{
            background: '#ffffff',
            color: '#007f71',
            padding: '12px 22px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 14,
            textDecoration: 'none'
          }}
        >
          + Sewa Kendaraan Lagi
        </Link>
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
        Riwayat Reservasi & Ruang Kontrol Digital Anda
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bookings.map((b) => {
          const isCheckedIn = checkedInIds.includes(b.id);
          return (
            <div
              key={b.id}
              className="bobo-panel"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#0f2926' }}>{b.carName}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  ID Booking: <strong>{b.id}</strong> • {b.startDate} s/d {b.endDate} ({b.totalDays} hari)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => toggleCheckIn(b.id)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 999,
                    border: '1.5px solid #00a896',
                    background: isCheckedIn ? '#00a896' : '#ffffff',
                    color: isCheckedIn ? '#ffffff' : '#007f71',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer'
                  }}
                >
                  {isCheckedIn ? '🔓 Smart Key & IoT Aktif' : '📲 Digital Check-in'}
                </button>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#007f71' }}>
                    Rp {b.totalPrice.toLocaleString('id-ID')}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: b.status === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
                      color: b.status === 'CANCELLED' ? '#b91c1c' : '#15803d'
                    }}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}