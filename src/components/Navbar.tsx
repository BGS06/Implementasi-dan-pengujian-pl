'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  membershipTier: string;
}

export default function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('yukjalan_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('yukjalan_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="bobo-navbar">
      <div className="bobo-nav-container">
        <Link href="/" className="bobo-logo">
          <span className="bobo-logo-badge">YJ</span>
          <span>
            YukJalan <span style={{ fontWeight: 500, color: '#00a896' }}>RentPod</span>
          </span>
        </Link>

        <nav className="bobo-nav-links">
          <Link href="/" className="bobo-nav-link">
            Katalog Armada
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <Link href="/dashboard/admin" className="bobo-nav-cta">
                  🛠️ Ruang Kontrol Admin
                </Link>
              ) : (
                <Link href="/dashboard/customer" className="bobo-nav-cta">
                  👤 Dashboard Penyewa ({user.name.split(' ')[0]})
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="bobo-nav-link"
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="bobo-nav-link">
                Log In
              </Link>
              <Link href="/register" className="bobo-nav-cta">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}