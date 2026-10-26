'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [usePhone, setUsePhone] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal login');
      } else {
        localStorage.setItem('yukjalan_user', JSON.stringify(json.data));
        // Koordinasi arah halaman sesuai role user
        if (json.data.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/customer');
        }
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'CUSTOMER' | 'ADMIN') => {
    setUsePhone(false);
    if (role === 'ADMIN') {
      setIdentifier('admin@yukjalan.id');
      setPassword('admin123');
    } else {
      setIdentifier('bintang@yukjalan.id');
      setPassword('customer123');
    }
  };

  return (
    <div>
      {/* Breadcrumb sesuai gambar referensi */}
      <div className="bobo-breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <strong>Log In</strong>
      </div>

      <div className="bobo-auth-wrapper">
        {/* Kolom Kiri: 4 Highlight Fitur dengan Ikon Teal */}
        <div className="bobo-feature-list">
          <div className="bobo-feature-item">
            <div className="bobo-feature-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="1.6">
                <path d="M12 2L14.5 7.5L20 10L14.5 12.5L12 18L9.5 12.5L4 10L9.5 7.5L12 2Z" />
                <path d="M16 16L19 22M19 22L22 19M19 22V14" />
              </svg>
            </div>
            <div className="bobo-feature-text">
              <h4>Proses Pemesanan yang Simpel</h4>
              <p>
                Pesan kendaraan dengan mudah dan cepat. Tidak perlu khawatir, hanya dengan satu sentuhan layar, kamu
                bisa memperoleh unit mobil yang kamu butuhkan.
              </p>
            </div>
          </div>

          <div className="bobo-feature-item">
            <div className="bobo-feature-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="1.6">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07" />
              </svg>
            </div>
            <div className="bobo-feature-text">
              <h4>Ruang Kontrol Digital dengan IoT</h4>
              <p>
                Cukup dengan smartphone, kamu dapat mengontrol akses kendaraan, pantau titik koordinat GPS real-time,
                serta konsultasi rute dengan AI Car Advisor.
              </p>
            </div>
          </div>

          <div className="bobo-feature-item">
            <div className="bobo-feature-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="1.6">
                <path d="M12 22S19 18 19 11V5L12 2L5 5V11C5 18 12 22 12 22Z" />
                <path d="M12 8V14M9 11H15" />
              </svg>
            </div>
            <div className="bobo-feature-text">
              <h4>Sistem Check-in Tanpa Hambatan</h4>
              <p>
                Tidak perlu khawatir lagi ketika serah terima unit. Cukup verifikasi data pribadimu secara digital,
                host kami akan membantu proses verifikasi data di mana pun dan kapan pun.
              </p>
            </div>
          </div>

          <div className="bobo-feature-item">
            <div className="bobo-feature-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="1.6">
                <path d="M21 15A2 2 0 0 1 19 17H7L3 21V5A2 2 0 0 1 5 3H19A2 2 0 0 1 21 5Z" />
                <path d="M12 7V11M12 14H12.01" />
              </svg>
            </div>
            <div className="bobo-feature-text">
              <h4>Pelayanan Host 24 Jam</h4>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kartu Form Log In */}
        <div className="bobo-auth-card">
          <div className="bobo-auth-header">
            <div className="bobo-mascot-circle">
              <span style={{ fontSize: 32 }}>🐨</span>
            </div>
            <div>
              <h2>Masuk ke Akun Bobobox</h2>
              <p>Pengalaman luar biasa perjalanan YukJalan kamu dimulai di sini</p>
            </div>
          </div>

          {/* Tombol bantu pengisian cepat untuk pengujian Penyewa vs Admin */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 10,
              padding: '10px 12px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 12
            }}
          >
            <span style={{ color: '#475569', fontWeight: 600 }}>Coba Akun Demo:</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fillDemo('CUSTOMER')}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #00a896',
                  background: '#e6f6f4',
                  color: '#007f71',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                👤 Isi Akun Penyewa
              </button>
              <button
                type="button"
                onClick={() => fillDemo('ADMIN')}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #0f2926',
                  background: '#0f2926',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                🛠️ Isi Akun Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="bobo-label-row">
              <label>{usePhone ? 'Nomor HP' : 'Email'}</label>
              <button
                type="button"
                className="bobo-teal-link"
                onClick={() => {
                  setUsePhone(!usePhone);
                  setIdentifier('');
                }}
              >
                {usePhone ? 'Pakai email?' : 'Pakai nomor HP?'}
              </button>
            </div>

            <div className="bobo-auth-input-wrap">
              <input
                type={usePhone ? 'tel' : 'email'}
                className="bobo-auth-input"
                placeholder={usePhone ? 'Masukkan nomor HP anda di sini' : 'Masukkan email anda di sini'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="bobo-label-row">
              <label>Password</label>
              <button
                type="button"
                className="bobo-teal-link"
                onClick={() => alert('Gunakan password demo: customer123 (Penyewa) atau admin123 (Admin)')}
              >
                Lupa password?
              </button>
            </div>

            <div className="bobo-auth-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="bobo-auth-input"
                placeholder="Type your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="bobo-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle Password"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 14
                }}
              >
                {errorMsg}
              </div>
            )}

            <button type="submit" className="bobo-btn-auth-submit" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Log in'}
            </button>
          </form>

          <div className="bobo-divider">
            <span>atau lanjutkan dengan</span>
          </div>

          <button
            type="button"
            className="bobo-btn-other"
            onClick={() => fillDemo('CUSTOMER')}
          >
            Other methods
          </button>

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#1e293b' }}>
            Belum punya akun Bobobox?{' '}
            <Link href="/register" className="bobo-teal-link" style={{ fontWeight: 700, fontSize: 14 }}>
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}