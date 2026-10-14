import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-6 text-center">
      <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold text-indigo-700">
        Next.js App Router • TypeScript OOP • Supabase • Gemini AI
      </span>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
        RentPod 2.0 Smart Car Rental
      </h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Pilih portal di bawah ini untuk menguji fitur Smart AI Car Advisor (Customer) atau Live Fleet GPS Tracking (Admin).
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/dashboard/customer"
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Buka Dashboard Customer (AI Advisor)
        </Link>
        <Link
          href="/dashboard/admin"
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
        >
          Buka Dashboard Admin (Live GPS)
        </Link>
      </div>
    </main>
  );
}