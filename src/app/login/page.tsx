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
    <div className="auth-container">
      <div className="auth-breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <strong>Log In</strong>
      </div>

      <div className="auth-grid">
        {/* Kolom Kiri: List Fitur */}
        <div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L14.5 7.5L20 10L14.5 12.5L12 18L9.5 12.5L4 10L9.5 7.5L12 2Z" />
              <path d="M16 16L19 22M19 22L22 19M19 22V14" />
            </svg>
            <div className="feature-text">
              <h3>Proses Pemesanan yang Simpel</h3>
              <p>Pesan kendaraan dengan mudah dan cepat. Tidak perlu khawatir, hanya dengan satu sentuhan layar, kamu bisa memperoleh unit mobil yang kamu butuhkan.</p>
            </div>
          </div>

          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07" />
            </svg>
            <div className="feature-text">
              <h3>Ruang Kontrol Digital dengan IoT</h3>
              <p>Cukup dengan smartphone, kamu dapat mengontrol akses kendaraan, pantau titik koordinat GPS real-time, serta konsultasi rute dengan AI Car Advisor.</p>
            </div>
          </div>

          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22S19 18 19 11V5L12 2L5 5V11C5 18 12 22 12 22Z" />
              <path d="M12 8V14M9 11H15" />
            </svg>
            <div className="feature-text">
              <h3>Sistem Check-in Tanpa Hambatan</h3>
              <p>Tidak perlu khawatir lagi ketika serah terima unit. Cukup upload KTP dan data pribadimu, host kami akan membantu proses verifikasi data secara otomatis.</p>
            </div>
          </div>

          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15A2 2 0 0 1 19 17H7L3 21V5A2 2 0 0 1 5 3H19A2 2 0 0 1 21 5Z" />
              <path d="M12 7V11M12 14H12.01" />
            </svg>
            <div className="feature-text">
              <h3>Pelayanan Host 24 Jam</h3>
              <p>Dukungan penuh dari tim kami selama perjalanan Anda untuk memastikan kenyamanan maksimal di mana pun dan kapan pun.</p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kartu Form Log In */}
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </div>
            <div className="auth-header-text">
              <h2>Masuk ke Akun</h2>
              <p>Pengalaman luar biasa perjalanan YukJalan kamu dimulai di sini.</p>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <div className="label-row">
                <label>{usePhone ? 'Nomor HP' : 'Email'}</label>
                <button type="button" onClick={() => { setUsePhone(!usePhone); setIdentifier(''); }}>
                  {usePhone ? 'Pakai email?' : 'Pakai nomor HP?'}
                </button>
              </div>
              <input
                type={usePhone ? 'tel' : 'email'}
                className="form-input"
                placeholder={usePhone ? "Masukkan nomor HP anda" : "Masukkan email anda di sini"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <button type="button">Lupa password?</button>
              </div>
              <div className="form-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Ketik password anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                {errorMsg}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Log in'}
            </button>
          </form>

          <div className="divider"><span>atau lanjutkan dengan</span></div>

          <button type="button" className="btn-outline">
            Metode lain
          </button>

          <div className="auth-footer">
            Belum punya akun YukJalan? <Link href="/register">Daftar di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}