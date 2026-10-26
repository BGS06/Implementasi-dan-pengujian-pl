'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [usePhone, setUsePhone] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || (role === 'ADMIN' ? 'Admin Baru' : 'Penyewa Baru'),
          email: usePhone ? `${phone}@yukjalan.id` : email,
          phone: phone || '081200000000',
          password: password || '123456',
          role
        })
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal membuat akun');
      } else {
        localStorage.setItem('yukjalan_user', JSON.stringify(json.data));
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

  return (
    <div>
      {/* Breadcrumb sesuai gambar referensi Register */}
      <div className="bobo-breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <strong>Register</strong>
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
                Tidak perlu khawatir lagi ketika serah terima unit. Cukup upload KTP dan data pribadimu, host kami akan
                membantu proses verifikasi data. Hanya dengan sekali klik, kamu dapat check-in di mana pun dan kapan pun.
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

        {/* Kolom Kanan: Kartu Buat Akun */}
        <div className="bobo-auth-card">
          <div className="bobo-auth-header">
            <div className="bobo-mascot-circle">
              <span style={{ fontSize: 32 }}>🐨</span>
            </div>
            <div>
              <h2>Buat Akun</h2>
              <p>Register to discover exciting vouchers, deals and more.</p>
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div className="bobo-label-row">
              <label>{usePhone ? 'Nomor HP' : 'Email'}</label>
              <button
                type="button"
                className="bobo-teal-link"
                onClick={() => setUsePhone(!usePhone)}
              >
                {usePhone ? 'Pakai email?' : 'Pakai nomor HP?'}
              </button>
            </div>

            <div className="bobo-auth-input-wrap">
              {usePhone ? (
                <input
                  type="tel"
                  className="bobo-auth-input"
                  placeholder="Masukkan nomor HP anda di sini"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              ) : (
                <input
                  type="email"
                  className="bobo-auth-input"
                  placeholder="Masukkan email anda di sini"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="bobo-label-row">
              <label>Nama Lengkap</label>
            </div>
            <div className="bobo-auth-input-wrap">
              <input
                type="text"
                className="bobo-auth-input"
                placeholder="Masukkan nama lengkap anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="bobo-label-row">
              <label>Password</label>
            </div>
            <div className="bobo-auth-input-wrap">
              <input
                type="password"
                className="bobo-auth-input"
                placeholder="Buat password akun anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="bobo-label-row">
              <label>Daftar Sebagai Peran (Role)</label>
            </div>
            <div className="bobo-role-selector">
              <button
                type="button"
                className={`bobo-role-option ${role === 'CUSTOMER' ? 'active' : ''}`}
                onClick={() => setRole('CUSTOMER')}
              >
                🚗 Pengguna / Penyewa
              </button>
              <button
                type="button"
                className={`bobo-role-option ${role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setRole('ADMIN')}
              >
                🛠️ Admin Pengelola
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
              {loading ? 'Membuat Akun...' : 'Create Account'}
            </button>
          </form>

          <div className="bobo-divider">
            <span>atau lanjutkan dengan</span>
          </div>

          <button
            type="button"
            className="bobo-btn-other"
            onClick={() => router.push('/login')}
          >
            Other methods
          </button>

          <div style={{ textAlign: 'center', marginTop: 26, fontSize: 14, color: '#1e293b' }}>
            Sudah punya akun sebelumnya?{' '}
            <Link href="/login" className="bobo-teal-link" style={{ fontWeight: 700, fontSize: 14 }}>
              Masuk di sini
            </Link>
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#64748b',
              marginTop: 24,
              lineHeight: 1.6
            }}
          >
            Dengan registering, saya menyetujui{' '}
            <span className="bobo-teal-link" style={{ fontSize: 12 }}>
              Syarat dan Ketentuan
            </span>{' '}
            dan{' '}
            <span className="bobo-teal-link" style={{ fontSize: 12 }}>
              Pemberitahuan Pelindungan Data Pribadi
            </span>{' '}
            dari Bobobox.
          </p>
        </div>
      </div>
    </div>
  );
}