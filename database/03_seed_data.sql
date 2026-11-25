-- =========================================
-- 03_SEED_DATA.SQL
-- DATA AWAL CARI SPOT
-- =========================================

-- KATEGORI
INSERT INTO CATEGORIES (category_name)
VALUES ('Cafe');

INSERT INTO CATEGORIES (category_name)
VALUES ('Warkop');

INSERT INTO CATEGORIES (category_name)
VALUES ('Perpustakaan');


-- TEMPAT
INSERT INTO PLACES (
    category_id,
    place_name,
    address,
    description,
    latitude,
    longitude
)
SELECT category_id,
       'Cafe Demo',
       'Banda Aceh',
       'Tempat pengujian aplikasi Cari Spot',
       5.5483,
       95.3238
FROM CATEGORIES
WHERE category_name = 'Cafe';


INSERT INTO PLACES (
    category_id,
    place_name,
    address,
    description
)
SELECT category_id,
       'Warkop Demo',
       'Banda Aceh',
       'Tempat pengujian kedua Cari Spot'
FROM CATEGORIES
WHERE category_name = 'Warkop';


-- AKUN DEMO
INSERT INTO USERS (
    full_name,
    email,
    password_hash
)
VALUES (
    'Demo User 1',
    'demo1@carispot.test',
    'DEMO_HASH_1'
);

INSERT INTO USERS (
    full_name,
    email,
    password_hash
)
VALUES (
    'Demo User 2',
    'demo2@carispot.test',
    'DEMO_HASH_2'
);


-- SETTINGS
INSERT INTO SETTINGS
VALUES (
    'REPORT_TTL_MINUTES',
    '30',
    'Laporan berlaku selama 30 menit'
);

INSERT INTO SETTINGS
VALUES (
    'MIN_REPORT_INTERVAL',
    '5',
    'Jarak minimal antar laporan dalam menit'
);

INSERT INTO SETTINGS
VALUES (
    'MIN_CHECKOUT_MINUTES',
    '5',
    'Durasi minimal check-in sebelum checkout'
);

INSERT INTO SETTINGS
VALUES (
    'POINT_CHECKOUT',
    '10',
    'Poin yang diperoleh setelah checkout'
);

INSERT INTO SETTINGS
VALUES (
    'POINT_REPORT',
    '2',
    'Poin yang diperoleh setelah melaporkan kondisi'
);


-- CHECK-IN UNTUK DUA AKUN DEMO
INSERT INTO CHECKINS (user_id, place_id)
SELECT u.user_id, p.place_id
FROM USERS u
CROSS JOIN PLACES p
WHERE u.email = 'demo1@carispot.test'
AND p.place_name = 'Cafe Demo';

INSERT INTO CHECKINS (user_id, place_id)
SELECT u.user_id, p.place_id
FROM USERS u
CROSS JOIN PLACES p
WHERE u.email = 'demo2@carispot.test'
AND p.place_name = 'Cafe Demo';


-- LAPORAN AWAL DARI DUA PENGGUNA
INSERT INTO CONDITION_REPORTS (
    checkin_id,
    user_id,
    place_id,
    crowd_level,
    socket_available,
    wifi_speed,
    wifi_mbps
)
SELECT c.checkin_id,
       c.user_id,
       c.place_id,
       'SEPI',
       'Y',
       'CEPAT',
       25
FROM CHECKINS c
JOIN USERS u ON u.user_id = c.user_id
JOIN PLACES p ON p.place_id = c.place_id
WHERE u.email IN (
    'demo1@carispot.test',
    'demo2@carispot.test'
)
AND p.place_name = 'Cafe Demo';


COMMIT;


SELECT * FROM CATEGORIES;

SELECT * FROM PLACES;

SELECT * FROM USERS;

SELECT * FROM SETTINGS;

SELECT * FROM CHECKINS;
