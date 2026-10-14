// src/components/LiveGpsTrackerMap.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { supabaseClient } from '@/lib/supabase';

interface FleetMarker {
  carId: string;
  fullName: string;
  licensePlate: string;
  status: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  isOutOfBounds: boolean;
  distanceFromPoolKm: number;
  lastUpdated: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '480px',
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: -7.2575,
  lng: 112.7521,
};

/**
 * Komponen Live GPS Tracking untuk Admin (Diadaptasi dari RentPod lama + Supabase Realtime)
 */
export default function LiveGpsTrackerMap({ initialFleet }: { initialFleet: FleetMarker[] }) {
  const [fleet, setFleet] = useState<FleetMarker[]>(initialFleet);
  const [selectedCar, setSelectedCar] = useState<FleetMarker | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    // Subscribe ke perubahan tabel `cars` di Supabase secara real-time
    const channel = supabaseClient
      .channel('realtime-fleet-gps')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cars' },
        (payload) => {
          const updated = payload.new as any;
          setFleet((prev) =>
            prev.map((item) =>
              item.carId === updated.id
                ? {
                    ...item,
                    latitude: Number(updated.latitude),
                    longitude: Number(updated.longitude),
                    speedKmh: Number(updated.speed_kmh ?? 0),
                    status: updated.status,
                    lastUpdated: new Date().toISOString(),
                  }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
        Memuat Peta Live GPS Tracking...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Live Fleet GPS Tracking (Supabase Realtime)</h3>
          <p className="text-xs text-slate-500">
            Memantau posisi, kecepatan, dan radius operasional seluruh mobil secara langsung.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          Realtime Active ({fleet.length} Unit)
        </span>
      </div>

      <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={11}>
        {fleet.map((car) => (
          <MarkerF
            key={car.carId}
            position={{ lat: car.latitude, lng: car.longitude }}
            onClick={() => setSelectedCar(car)}
          />
        ))}

        {selectedCar && (
          <InfoWindowF
            position={{ lat: selectedCar.latitude, lng: selectedCar.longitude }}
            onCloseClick={() => setSelectedCar(null)}
          >
            <div className="p-1 text-xs text-slate-800">
              <p className="font-bold text-slate-900">{selectedCar.fullName}</p>
              <p className="text-slate-500">Plat: {selectedCar.licensePlate}</p>
              <p className="mt-1">
                Kecepatan: <strong>{selectedCar.speedKmh} km/jam</strong>
              </p>
              <p>
                Jarak dari Pool: <strong>{selectedCar.distanceFromPoolKm} km</strong>
              </p>
              {selectedCar.isOutOfBounds && (
                <p className="mt-1 font-bold text-red-600">
                  PERINGATAN: Melewati batas radius operasional!
                </p>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}