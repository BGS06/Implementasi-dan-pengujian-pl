// src/app/dashboard/customer/page.tsx
import React from 'react';
import AICarAdvisorChat from '@/components/AICarAdvisorChat';

export default function CustomerDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Dashboard Pelanggan RentPod
          </h1>
          <p className="text-sm text-slate-500">
            Temukan mobil terbaik dengan rekomendasi AI dan diskon otomatis sesuai level Membership Anda.
          </p>
        </div>
      </header>

      <AICarAdvisorChat membershipTier="VIP" />
    </main>
  );
}