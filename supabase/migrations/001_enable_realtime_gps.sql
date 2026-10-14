-- supabase/migrations/001_enable_realtime_gps.sql
-- Aktifkan fitur Supabase Realtime untuk tabel cars dan gps_tracking_logs
-- agar marker mobil di Google Maps Admin bergerak secara live tanpa reload halaman.

alter publication supabase_realtime add table public.cars;
alter publication supabase_realtime add table public.gps_tracking_logs;

-- Index geospasial sederhana untuk mempercepat query armada aktif
create index if not exists idx_cars_status on public.cars (status);
create index if not exists idx_gps_logs_car_time on public.gps_tracking_logs (car_id, recorded_at desc);