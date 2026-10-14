// src/components/AICarAdvisorChat.tsx
'use client';

import React, { useState } from 'react';
import { AIRecommendationResult, MembershipTier } from '@/domain/interfaces';

interface Props {
  membershipTier: MembershipTier;
  onSelectCarForBooking?: (carId: string, days: number) => void;
}

export default function AICarAdvisorChat({ membershipTier, onSelectCarForBooking }: Props) {
  const [prompt, setPrompt] = useState('');
  const [rentalDays, setRentalDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, rentalDays, membershipTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat rekomendasi AI');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Powered by Gemini AI + OOP Pricing Engine
          </span>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            RentPod Smart AI Car Advisor
          </h2>
          <p className="text-sm text-slate-500">
            Ceritakan rencana perjalanan, jumlah penumpang, dan budget Anda.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Status Membership</span>
          <p className="font-bold text-indigo-600">{membershipTier}</p>
        </div>
      </div>

      <form onSubmit={handleAskAI} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Kebutuhan Perjalanan Anda
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Contoh: Saya butuh mobil nyaman untuk liburan keluarga 6 orang ke Malang selama 3 hari dengan budget di bawah Rp 1.800.000..."
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Durasi Sewa (Hari)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={rentalDays}
              onChange={(e) => setRentalDays(Number(e.target.value))}
              className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Menganalisis Armada & Harga...' : 'Cari Rekomendasi AI'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-4">
          <div className="rounded-xl bg-indigo-50/70 p-4 text-sm text-slate-800">
            <p className="font-medium text-indigo-950">{result.summaryMessage}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {result.recommendations.map((rec) => (
              <div
                key={rec.carId}
                className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 hover:border-indigo-400"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {rec.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      Match {rec.matchScore}%
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{rec.brandModel}</h3>
                  <p className="mt-1 text-xs text-slate-600">{rec.reasoning}</p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Harga Normal + Asuransi:</span>
                    <span className="line-through">
                      Rp {rec.grossCost.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Diskon {membershipTier}:</span>
                    <span>-Rp {rec.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-700">Estimasi Total:</span>
                    <span className="text-base font-extrabold text-indigo-600">
                      Rp {rec.estimatedNetCost.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {onSelectCarForBooking && (
                    <button
                      onClick={() => onSelectCarForBooking(rec.carId, rentalDays)}
                      className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Pilih & Booking Mobil Ini
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}