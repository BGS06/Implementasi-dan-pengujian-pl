-- ============================================================
-- YUKJALAN - SQL PostgreSQL / Supabase
-- Dibuat berdasarkan diagram UML terakhir yang dikirim.
-- Jalankan pada database baru/kosong.
--
-- Pemetaan diagram:
-- Tabel: User, Customer, Admin, Membership, RegularMembership,
-- VipMembership, Vehicle, GpsCoordinate, Car, CityCar, FamilyCar,
-- LuxuryCar, ElectricCar, Motorcycle, ScooterMotorcycle,
-- SportMotorcycle, AdventureMotorcycle, ElectricMotorcycle,
-- Booking, PaymentMethod, BankTransferPayment, QrisPayment,
-- EWalletPayment.
--
-- Tidak dibuat tabel untuk interface / service / repository / return type:
-- IPaymentGateway, ITrackable, MembershipStrategy, IAIAdvisor,
-- AIVehicleAdvisorService, VehicleRepository, TrackingTelemetry,
-- PaymentReceipt, AIRecommendationResult. Semua itu adalah kontrak
-- atau logic aplikasi, bukan objek penyimpanan pada diagram.
-- ============================================================

BEGIN;

-- ENUM dipakai pada tipe atribut dan nilai balik method di diagram.
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE membership_tier AS ENUM ('REGULAR', 'VIP');
CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE');
CREATE TYPE vehicle_type AS ENUM ('CAR', 'MOTORCYCLE');
CREATE TYPE transmission_type AS ENUM ('AUTOMATIC', 'MANUAL');
CREATE TYPE payment_type AS ENUM ('BANK_TRANSFER', 'QRIS', 'EWALLET');

-- ===================== USER / CUSTOMER / ADMIN =====================
CREATE TABLE users (
    id              VARCHAR(10) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL
);

CREATE TABLE memberships (
    id          VARCHAR(10) PRIMARY KEY,
    tier_name   membership_tier NOT NULL
);

CREATE TABLE regular_memberships (
    membership_id VARCHAR(10) PRIMARY KEY
        REFERENCES memberships(id) ON DELETE CASCADE
);

CREATE TABLE vip_memberships (
    membership_id VARCHAR(10) PRIMARY KEY
        REFERENCES memberships(id) ON DELETE CASCADE
);

CREATE TABLE customers (
    user_id                 VARCHAR(10) PRIMARY KEY
        REFERENCES users(id) ON DELETE CASCADE,
    driver_license_number   VARCHAR(40) NOT NULL UNIQUE,
    membership_id           VARCHAR(10) NOT NULL
        REFERENCES memberships(id),
    loyalty_points          INTEGER NOT NULL DEFAULT 0
        CHECK (loyalty_points >= 0)
);

CREATE TABLE admins (
    user_id     VARCHAR(10) PRIMARY KEY
        REFERENCES users(id) ON DELETE CASCADE,
    department  VARCHAR(100) NOT NULL
);

-- ===================== VEHICLE / GPS =====================
-- Vehicle is abstract in UML; vehicles is the shared parent table.
-- VehicleType is derived from whether a row exists in cars or motorcycles.
CREATE TABLE vehicles (
    id                  VARCHAR(10) PRIMARY KEY,
    brand               VARCHAR(60) NOT NULL,
    model               VARCHAR(80) NOT NULL,
    license_plate       VARCHAR(20) NOT NULL UNIQUE,
    base_rate_per_day   NUMERIC(12,2) NOT NULL
        CHECK (base_rate_per_day >= 0),
    status              vehicle_status NOT NULL DEFAULT 'AVAILABLE'
);

-- Composition Vehicle *-- GpsCoordinate is stored as a dependent 1:1 row.
-- vehicle_id is the primary/foreign key: the coordinate is owned by one vehicle.
CREATE TABLE gps_coordinates (
    vehicle_id  VARCHAR(10) PRIMARY KEY
        REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude    NUMERIC(10,7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude   NUMERIC(10,7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    speed_kmh   NUMERIC(7,2) NOT NULL CHECK (speed_kmh >= 0),
    updated_at  TIMESTAMP NOT NULL
);

-- ===================== CAR AND ITS SUBCLASSES =====================
-- Car is abstract in UML and inherits shared fields from Vehicle.
CREATE TABLE cars (
    vehicle_id      VARCHAR(10) PRIMARY KEY
        REFERENCES vehicles(id) ON DELETE CASCADE,
    seat_capacity   INTEGER NOT NULL CHECK (seat_capacity > 0)
);

CREATE TABLE city_cars (
    vehicle_id VARCHAR(10) PRIMARY KEY
        REFERENCES cars(vehicle_id) ON DELETE CASCADE
);

CREATE TABLE family_cars (
    vehicle_id              VARCHAR(10) PRIMARY KEY
        REFERENCES cars(vehicle_id) ON DELETE CASCADE,
    has_third_row_seat      BOOLEAN NOT NULL,
    luggage_liters INTEGER NOT NULL CHECK (luggage_liters >= 0)
);

CREATE TABLE luxury_cars (
    vehicle_id          VARCHAR(10) PRIMARY KEY
        REFERENCES cars(vehicle_id) ON DELETE CASCADE,
    chauffeur_included  BOOLEAN NOT NULL,
    security_deposit    NUMERIC(12,2) NOT NULL CHECK (security_deposit >= 0)
);

CREATE TABLE electric_cars (
    vehicle_id              VARCHAR(10) PRIMARY KEY
        REFERENCES cars(vehicle_id) ON DELETE CASCADE,
    battery_capacity_kwh    NUMERIC(8,2) NOT NULL CHECK (battery_capacity_kwh > 0),
    range_km                INTEGER NOT NULL CHECK (range_km > 0)
);

-- ===================== MOTORCYCLE AND ITS SUBCLASSES =====================
-- Mengikuti diagram terakhir: Scooter, Sport, Adventure, Electric.
CREATE TABLE motorcycles (
    vehicle_id              VARCHAR(10) PRIMARY KEY
        REFERENCES vehicles(id) ON DELETE CASCADE,
    engine_capacity_cc      INTEGER NOT NULL CHECK (engine_capacity_cc >= 0),
    transmission            transmission_type NOT NULL,
    helmet_included         BOOLEAN NOT NULL
);

CREATE TABLE scooter_motorcycles (
    vehicle_id                  VARCHAR(10) PRIMARY KEY
        REFERENCES motorcycles(vehicle_id) ON DELETE CASCADE,
    underseat_storage_liters    NUMERIC(6,2) NOT NULL
        CHECK (underseat_storage_liters >= 0)
);

CREATE TABLE sport_motorcycles (
    vehicle_id      VARCHAR(10) PRIMARY KEY
        REFERENCES motorcycles(vehicle_id) ON DELETE CASCADE,
    sport_category  VARCHAR(60) NOT NULL
);

CREATE TABLE adventure_motorcycles (
    vehicle_id              VARCHAR(10) PRIMARY KEY
        REFERENCES motorcycles(vehicle_id) ON DELETE CASCADE,
    ground_clearance_mm     INTEGER NOT NULL CHECK (ground_clearance_mm > 0),
    fuel_capacity_liters    NUMERIC(6,2) NOT NULL CHECK (fuel_capacity_liters > 0)
);

CREATE TABLE electric_motorcycles (
    vehicle_id              VARCHAR(10) PRIMARY KEY
        REFERENCES motorcycles(vehicle_id) ON DELETE CASCADE,
    battery_capacity_kwh    NUMERIC(8,2) NOT NULL CHECK (battery_capacity_kwh > 0),
    range_km                INTEGER NOT NULL CHECK (range_km > 0)
);

-- ===================== PAYMENT =====================
-- IPaymentGateway adalah interface. PaymentMethod mengimplementasikan interface.
-- PaymentType didapat dari subclass payment yang dipakai.
CREATE TABLE payment_methods (
    id              VARCHAR(10) PRIMARY KEY,
    transaction_id  VARCHAR(60) NOT NULL UNIQUE,
    status          VARCHAR(30) NOT NULL
);

CREATE TABLE bank_transfer_payments (
    payment_id              VARCHAR(10) PRIMARY KEY
        REFERENCES payment_methods(id) ON DELETE CASCADE,
    bank_code               VARCHAR(20) NOT NULL,
    virtual_account_number  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE qris_payments (
    payment_id      VARCHAR(10) PRIMARY KEY
        REFERENCES payment_methods(id) ON DELETE CASCADE,
    merchant_qr_id  VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE ewallet_payments (
    payment_id      VARCHAR(10) PRIMARY KEY
        REFERENCES payment_methods(id) ON DELETE CASCADE,
    wallet_provider VARCHAR(50) NOT NULL,
    phone_number    VARCHAR(25) NOT NULL
);

-- ===================== BOOKING =====================
-- payment_method_id merepresentasikan referensi paymentGateway pada UML.
CREATE TABLE bookings (
    id                  VARCHAR(10) PRIMARY KEY,
    customer_id         VARCHAR(10) NOT NULL
        REFERENCES customers(user_id),
    vehicle_id          VARCHAR(10) NOT NULL
        REFERENCES vehicles(id),
    payment_method_id   VARCHAR(10) UNIQUE
        REFERENCES payment_methods(id),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    CHECK (end_date >= start_date)
);

-- ============================================================
-- DATA UJI: minimal 5 baris per tabel
-- ============================================================

-- Users: lima Customer dan lima Admin.
INSERT INTO users (id, name, email, password_hash, role) VALUES
('U001','Andi Pratama','andi@example.test','demo_hash_U001','CUSTOMER'),
('U002','Bunga Lestari','bunga@example.test','demo_hash_U002','CUSTOMER'),
('U003','Citra Maharani','citra@example.test','demo_hash_U003','CUSTOMER'),
('U004','Dewi Anggraini','dewi@example.test','demo_hash_U004','CUSTOMER'),
('U005','Eko Saputra','eko@example.test','demo_hash_U005','CUSTOMER'),
('U006','Fajar Nugroho','fajar@example.test','demo_hash_U006','ADMIN'),
('U007','Gita Permata','gita@example.test','demo_hash_U007','ADMIN'),
('U008','Hendra Wijaya','hendra@example.test','demo_hash_U008','ADMIN'),
('U009','Intan Puspita','intan@example.test','demo_hash_U009','ADMIN'),
('U010','Joko Santoso','joko@example.test','demo_hash_U010','ADMIN');

-- Base Membership memiliki 10 entri: 5 Regular dan 5 VIP.
INSERT INTO memberships (id, tier_name) VALUES
('MB001','REGULAR'),('MB002','REGULAR'),('MB003','REGULAR'),
('MB004','REGULAR'),('MB005','REGULAR'),
('MB006','VIP'),('MB007','VIP'),('MB008','VIP'),
('MB009','VIP'),('MB010','VIP');

INSERT INTO regular_memberships (membership_id) VALUES
('MB001'),('MB002'),('MB003'),('MB004'),('MB005');
INSERT INTO vip_memberships (membership_id) VALUES
('MB006'),('MB007'),('MB008'),('MB009'),('MB010');

INSERT INTO customers (user_id, driver_license_number, membership_id, loyalty_points) VALUES
('U001','SIM-A-0001','MB001',10),
('U002','SIM-A-0002','MB006',120),
('U003','SIM-A-0003','MB002',35),
('U004','SIM-A-0004','MB007',200),
('U005','SIM-A-0005','MB003',55);

INSERT INTO admins (user_id, department) VALUES
('U006','Operasional'),('U007','Layanan Pelanggan'),
('U008','Keuangan'),('U009','Teknologi Informasi'),
('U010','Manajemen');

-- Parent vehicles: 20 cars and 20 motorcycles.
INSERT INTO vehicles (id, brand, model, license_plate, base_rate_per_day, status) VALUES
-- Cars: CityCar
('C001','Toyota','Agya','L-1001-YJ',250000,'AVAILABLE'),
('C002','Honda','Brio','L-1002-YJ',275000,'AVAILABLE'),
('C003','Daihatsu','Ayla','L-1003-YJ',230000,'AVAILABLE'),
('C004','Suzuki','S-Presso','L-1004-YJ',240000,'AVAILABLE'),
('C005','Kia','Picanto','L-1005-YJ',260000,'AVAILABLE'),
-- Cars: FamilyCar
('C006','Mitsubishi','Xpander','L-1006-YJ',450000,'AVAILABLE'),
('C007','Toyota','Avanza','L-1007-YJ',400000,'AVAILABLE'),
('C008','Suzuki','Ertiga','L-1008-YJ',410000,'AVAILABLE'),
('C009','Hyundai','Stargazer','L-1009-YJ',475000,'AVAILABLE'),
('C010','Toyota','Innova Zenix','L-1010-YJ',650000,'AVAILABLE'),
-- Cars: LuxuryCar
('C011','BMW','320i','L-1011-YJ',1200000,'AVAILABLE'),
('C012','Mercedes-Benz','C200','L-1012-YJ',1500000,'AVAILABLE'),
('C013','Lexus','ES 300h','L-1013-YJ',1800000,'AVAILABLE'),
('C014','Audi','A6','L-1014-YJ',1700000,'AVAILABLE'),
('C015','Toyota','Alphard','L-1015-YJ',2000000,'AVAILABLE'),
-- Cars: ElectricCar
('C016','Hyundai','Ioniq 5','L-1016-YJ',1500000,'AVAILABLE'),
('C017','Wuling','Air EV','L-1017-YJ',500000,'AVAILABLE'),
('C018','BYD','Dolphin','L-1018-YJ',800000,'AVAILABLE'),
('C019','MG','4 EV','L-1019-YJ',900000,'AVAILABLE'),
('C020','Tesla','Model 3','L-1020-YJ',1800000,'AVAILABLE'),
-- Motorcycles: ScooterMotorcycle
('M001','Honda','Vario 160','L-2001-YJ',100000,'AVAILABLE'),
('M002','Honda','Beat','L-2002-YJ',80000,'AVAILABLE'),
('M003','Yamaha','NMAX','L-2003-YJ',130000,'AVAILABLE'),
('M004','Yamaha','Mio M3','L-2004-YJ',75000,'AVAILABLE'),
('M005','Suzuki','Burgman Street','L-2005-YJ',95000,'AVAILABLE'),
-- Motorcycles: SportMotorcycle
('M006','Yamaha','R15','L-2006-YJ',180000,'AVAILABLE'),
('M007','Honda','CBR150R','L-2007-YJ',175000,'AVAILABLE'),
('M008','Kawasaki','Ninja 250','L-2008-YJ',250000,'AVAILABLE'),
('M009','Suzuki','GSX-R150','L-2009-YJ',170000,'AVAILABLE'),
('M010','Yamaha','YZF-R25','L-2010-YJ',240000,'AVAILABLE'),
-- Motorcycles: AdventureMotorcycle
('M011','Honda','CB150X','L-2011-YJ',200000,'AVAILABLE'),
('M012','Kawasaki','Versys-X 250','L-2012-YJ',300000,'AVAILABLE'),
('M013','BMW','G 310 GS','L-2013-YJ',350000,'AVAILABLE'),
('M014','KTM','390 Adventure','L-2014-YJ',400000,'AVAILABLE'),
('M015','Honda','CRF250 Rally','L-2015-YJ',350000,'AVAILABLE'),
-- Motorcycles: ElectricMotorcycle
('M016','Alva','One','L-2016-YJ',150000,'AVAILABLE'),
('M017','Gesits','G1','L-2017-YJ',140000,'AVAILABLE'),
('M018','Volta','401','L-2018-YJ',110000,'AVAILABLE'),
('M019','United','T1800','L-2019-YJ',160000,'AVAILABLE'),
('M020','Polytron','Fox-R','L-2020-YJ',160000,'AVAILABLE');

-- One GPS coordinate row for each vehicle.
INSERT INTO gps_coordinates (vehicle_id, latitude, longitude, speed_kmh, updated_at) VALUES
('C001',-7.2575000,112.7521000,0,'2026-10-19 08:00:00'),
('C002',-7.2650000,112.7460000,20,'2026-10-19 09:00:00'),
('C003',-7.2800000,112.7400000,35,'2026-10-19 10:00:00'),
('C004',-7.2900000,112.7300000,15,'2026-10-19 11:00:00'),
('C005',-7.3000000,112.7200000,5,'2026-10-19 12:00:00'),
('C006',-7.2574000,112.7522000,0,'2026-10-19 13:00:00'),
('C007',-7.2649000,112.7461000,20,'2026-10-19 14:00:00'),
('C008',-7.2799000,112.7401000,35,'2026-10-19 15:00:00'),
('C009',-7.2899000,112.7301000,15,'2026-10-19 08:05:00'),
('C010',-7.2999000,112.7201000,5,'2026-10-19 09:05:00'),
('C011',-7.2573000,112.7523000,0,'2026-10-19 10:05:00'),
('C012',-7.2648000,112.7462000,20,'2026-10-19 11:05:00'),
('C013',-7.2798000,112.7402000,35,'2026-10-19 12:05:00'),
('C014',-7.2898000,112.7302000,15,'2026-10-19 13:05:00'),
('C015',-7.2998000,112.7202000,5,'2026-10-19 14:05:00'),
('C016',-7.2572000,112.7524000,0,'2026-10-19 15:05:00'),
('C017',-7.2647000,112.7463000,20,'2026-10-19 08:10:00'),
('C018',-7.2797000,112.7403000,35,'2026-10-19 09:10:00'),
('C019',-7.2897000,112.7303000,15,'2026-10-19 10:10:00'),
('C020',-7.2997000,112.7203000,5,'2026-10-19 11:10:00'),
('M001',-7.2571000,112.7525000,0,'2026-10-19 12:10:00'),
('M002',-7.2646000,112.7464000,20,'2026-10-19 13:10:00'),
('M003',-7.2796000,112.7404000,35,'2026-10-19 14:10:00'),
('M004',-7.2896000,112.7304000,15,'2026-10-19 15:10:00'),
('M005',-7.2996000,112.7204000,5,'2026-10-19 08:15:00'),
('M006',-7.2570000,112.7526000,0,'2026-10-19 09:15:00'),
('M007',-7.2645000,112.7465000,20,'2026-10-19 10:15:00'),
('M008',-7.2795000,112.7405000,35,'2026-10-19 11:15:00'),
('M009',-7.2895000,112.7305000,15,'2026-10-19 12:15:00'),
('M010',-7.2995000,112.7205000,5,'2026-10-19 13:15:00'),
('M011',-7.2569000,112.7527000,0,'2026-10-19 14:15:00'),
('M012',-7.2644000,112.7466000,20,'2026-10-19 15:15:00'),
('M013',-7.2794000,112.7406000,35,'2026-10-19 08:20:00'),
('M014',-7.2894000,112.7306000,15,'2026-10-19 09:20:00'),
('M015',-7.2994000,112.7206000,5,'2026-10-19 10:20:00'),
('M016',-7.2568000,112.7528000,0,'2026-10-19 11:20:00'),
('M017',-7.2643000,112.7467000,20,'2026-10-19 12:20:00'),
('M018',-7.2793000,112.7407000,35,'2026-10-19 13:20:00'),
('M019',-7.2893000,112.7307000,15,'2026-10-19 14:20:00'),
('M020',-7.2993000,112.7207000,5,'2026-10-19 15:20:00');




-- Car parent class, with seat_capacity attribute.
INSERT INTO cars (vehicle_id, seat_capacity) VALUES
('C001',5),('C002',5),('C003',5),('C004',5),('C005',5),
('C006',7),('C007',7),('C008',7),('C009',7),('C010',7),
('C011',5),('C012',5),('C013',5),('C014',5),('C015',7),
('C016',5),('C017',4),('C018',5),('C019',5),('C020',5);

-- CityCar has no additional attributes in the diagram.
INSERT INTO city_cars (vehicle_id) VALUES ('C001'),('C002'),('C003'),('C004'),('C005');

INSERT INTO family_cars (vehicle_id, has_third_row_seat, luggage_liters) VALUES
('C006',TRUE,495),('C007',TRUE,400),('C008',TRUE,450),('C009',TRUE,430),('C010',TRUE,300);

INSERT INTO luxury_cars (vehicle_id, chauffeur_included, security_deposit) VALUES
('C011',FALSE,3000000),('C012',TRUE,3500000),('C013',TRUE,4000000),
('C014',TRUE,4000000),('C015',TRUE,5000000);

INSERT INTO electric_cars (vehicle_id, battery_capacity_kwh, range_km) VALUES
('C016',72.60,450),('C017',26.70,300),('C018',44.90,410),('C019',64.00,425),('C020',60.00,500);

-- Motorcycle parent class.
INSERT INTO motorcycles (vehicle_id, engine_capacity_cc, transmission, helmet_included) VALUES
('M001',160,'AUTOMATIC',TRUE),('M002',110,'AUTOMATIC',TRUE),
('M003',155,'AUTOMATIC',TRUE),('M004',125,'AUTOMATIC',TRUE),('M005',125,'AUTOMATIC',TRUE),
('M006',155,'MANUAL',TRUE),('M007',150,'MANUAL',TRUE),('M008',249,'MANUAL',TRUE),
('M009',150,'MANUAL',TRUE),('M010',250,'MANUAL',TRUE),
('M011',150,'MANUAL',TRUE),('M012',249,'MANUAL',TRUE),('M013',313,'MANUAL',TRUE),
('M014',373,'MANUAL',TRUE),('M015',249,'MANUAL',TRUE),
('M016',0,'AUTOMATIC',TRUE),('M017',0,'AUTOMATIC',TRUE),('M018',0,'AUTOMATIC',TRUE),
('M019',0,'AUTOMATIC',TRUE),('M020',0,'AUTOMATIC',TRUE);

INSERT INTO scooter_motorcycles (vehicle_id, underseat_storage_liters) VALUES
('M001',18),('M002',12),('M003',25),('M004',10),('M005',21);

INSERT INTO sport_motorcycles (vehicle_id, sport_category) VALUES
('M006','Supersport'),('M007','Sport'),('M008','Sport Touring'),
('M009','Supersport'),('M010','Sport Touring');

INSERT INTO adventure_motorcycles (vehicle_id, ground_clearance_mm, fuel_capacity_liters) VALUES
('M011',180,12),('M012',180,17),('M013',185,11),('M014',200,14),('M015',270,10);

INSERT INTO electric_motorcycles (vehicle_id, battery_capacity_kwh, range_km) VALUES
('M016',2.70,120),('M017',3.00,100),('M018',2.00,100),('M019',3.00,120),('M020',3.75,130);

-- PaymentMethod parent rows; 5 rows for each concrete payment method.
INSERT INTO payment_methods (id, transaction_id, status) VALUES
('P001','TRX-BANK-001','PAID'),('P002','TRX-BANK-002','PENDING'),
('P003','TRX-BANK-003','PAID'),('P004','TRX-BANK-004','FAILED'),('P005','TRX-BANK-005','PAID'),
('P006','TRX-QRIS-001','PAID'),('P007','TRX-QRIS-002','PENDING'),
('P008','TRX-QRIS-003','PAID'),('P009','TRX-QRIS-004','FAILED'),('P010','TRX-QRIS-005','PAID'),
('P011','TRX-EWALLET-001','PAID'),('P012','TRX-EWALLET-002','PENDING'),
('P013','TRX-EWALLET-003','PAID'),('P014','TRX-EWALLET-004','FAILED'),('P015','TRX-EWALLET-005','PAID');

INSERT INTO bank_transfer_payments (payment_id, bank_code, virtual_account_number) VALUES
('P001','BCA','880000000001'),('P002','BNI','880000000002'),('P003','BRI','880000000003'),
('P004','MANDIRI','880000000004'),('P005','BSI','880000000005');

INSERT INTO qris_payments (payment_id, merchant_qr_id) VALUES
('P006','QR-YJ-0006'),('P007','QR-YJ-0007'),('P008','QR-YJ-0008'),
('P009','QR-YJ-0009'),('P010','QR-YJ-0010');

INSERT INTO ewallet_payments (payment_id, wallet_provider, phone_number) VALUES
('P011','GoPay','081200000011'),('P012','OVO','081200000012'),
('P013','DANA','081200000013'),('P014','ShopeePay','081200000014'),
('P015','LinkAja','081200000015');

-- Booking has customer, vehicle, payment gateway, start date, end date.
-- There is no BookingStatus field in the submitted diagram, so it is not added.
INSERT INTO bookings (id, customer_id, vehicle_id, payment_method_id, start_date, end_date) VALUES
('B001','U001','C001','P001','2026-11-01','2026-11-03'),
('B002','U002','C006','P002','2026-11-02','2026-11-04'),
('B003','U003','C011','P003','2026-11-05','2026-11-07'),
('B004','U004','C016','P004','2026-11-08','2026-11-10'),
('B005','U005','C020','P005','2026-11-11','2026-11-13'),
('B006','U001','M001','P006','2026-11-14','2026-11-15'),
('B007','U002','M006','P007','2026-11-16','2026-11-18'),
('B008','U003','M011','P008','2026-11-19','2026-11-20'),
('B009','U004','M016','P009','2026-11-21','2026-11-22'),
('B010','U005','M002','P010','2026-11-23','2026-11-24'),
('B011','U001','C002','P011','2026-11-25','2026-11-27'),
('B012','U002','C007','P012','2026-11-28','2026-11-30'),
('B013','U003','C012','P013','2026-12-01','2026-12-02'),
('B014','U004','M007','P014','2026-12-03','2026-12-04'),
('B015','U005','M017','P015','2026-12-05','2026-12-06');

COMMIT;

-- ===================== VERIFIKASI JUMLAH DATA =====================
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'admins', COUNT(*) FROM admins
UNION ALL SELECT 'memberships', COUNT(*) FROM memberships
UNION ALL SELECT 'regular_memberships', COUNT(*) FROM regular_memberships
UNION ALL SELECT 'vip_memberships', COUNT(*) FROM vip_memberships
UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'gps_coordinates', COUNT(*) FROM gps_coordinates
UNION ALL SELECT 'cars', COUNT(*) FROM cars
UNION ALL SELECT 'city_cars', COUNT(*) FROM city_cars
UNION ALL SELECT 'family_cars', COUNT(*) FROM family_cars
UNION ALL SELECT 'luxury_cars', COUNT(*) FROM luxury_cars
UNION ALL SELECT 'electric_cars', COUNT(*) FROM electric_cars
UNION ALL SELECT 'motorcycles', COUNT(*) FROM motorcycles
UNION ALL SELECT 'scooter_motorcycles', COUNT(*) FROM scooter_motorcycles
UNION ALL SELECT 'sport_motorcycles', COUNT(*) FROM sport_motorcycles
UNION ALL SELECT 'adventure_motorcycles', COUNT(*) FROM adventure_motorcycles
UNION ALL SELECT 'electric_motorcycles', COUNT(*) FROM electric_motorcycles
UNION ALL SELECT 'payment_methods', COUNT(*) FROM payment_methods
UNION ALL SELECT 'bank_transfer_payments', COUNT(*) FROM bank_transfer_payments
UNION ALL SELECT 'qris_payments', COUNT(*) FROM qris_payments
UNION ALL SELECT 'ewallet_payments', COUNT(*) FROM ewallet_payments
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
ORDER BY table_name;

-- Cek jenis kendaraan dari tabel turunan (VehicleType diturunkan dari relasi kelas).
SELECT v.id, v.brand, v.model,
       CASE WHEN c.vehicle_id IS NOT NULL THEN 'CAR'
            WHEN m.vehicle_id IS NOT NULL THEN 'MOTORCYCLE'
            ELSE 'UNCLASSIFIED' END AS vehicle_type,
       v.status, v.base_rate_per_day
FROM vehicles v
LEFT JOIN cars c ON c.vehicle_id = v.id
LEFT JOIN motorcycles m ON m.vehicle_id = v.id
ORDER BY v.id;

