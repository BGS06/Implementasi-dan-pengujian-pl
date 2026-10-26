import React from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'YukJalan RentPod — Sewa Mobil Modern ala Bobobox',
  description: 'Platform Penyewaan Mobil Berbasis OOP, React, TypeScript & Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="bobo-main">{children}</main>
        <footer
          style={{
            background: '#0f2926',
            color: '#cbd5e1',
            padding: '36px 20px',
            textAlign: 'center',
            fontSize: 14
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <strong style={{ color: '#fff', fontSize: 16 }}>YukJalan RentPod Indonesia</strong>
            <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>
              Pengalaman sewa kendaraan pintar terinspirasi kenyamanan Bobobox • Terintegrasi AI Advisor & Live GPS
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}