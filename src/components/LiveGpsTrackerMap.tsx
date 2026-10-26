'use client';

import React, { useEffect, useState } from 'react';

interface GpsPoint {
  carId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  updatedAt: string;
}

export default function LiveGpsTrackerMap() {
  const [coords, setCoords] = useState<GpsPoint[]>([]);

  const fetchGps = async () => {
    try {
      const res = await fetch('/api/gps');
      const json = await res.json();
      if (json.data) setCoords(json.data);
    } catch {
      // ignore polling error
    }
  };

  useEffect(() => {
    fetchGps();
    const interval = setInterval(fetchGps, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bobo-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>📍 Live Fleet GPS Telemetry</h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Pemantauan koordinat armada real-time</span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            background: '#dcfce7',
            color: '#15803d',
            padding: '6px 12px',
            borderRadius: 999
          }}
        >
          ● Live 4s
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {coords.map((pt) => (
          <div
            key={pt.carId}
            style={{
              background: '#f5f8f7',
              padding: 14,
              borderRadius: 16,
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ fontWeight: 800, color: '#007f71', marginBottom: 6 }}>
              🚗 Unit: {pt.carId.toUpperCase()}
            </div>
            <div style={{ fontSize: 12.5, color: '#475569' }}>Latitude: {pt.latitude}</div>
            <div style={{ fontSize: 12.5, color: '#475569' }}>Longitude: {pt.longitude}</div>
            <div
              style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: 12,
                fontWeight: 700,
                color: '#0f2926',
                background: '#e6f6f4',
                padding: '3px 10px',
                borderRadius: 999
              }}
            >
              ⚡ {pt.speedKmh} km/jam
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}