-- =========================================
-- 08_GENERATE_TEST_DATA.SQL
-- MEMBUAT 20.000 DATA PENGUJIAN
-- =========================================

-- HAPUS LAPORAN LAMA DARI AKUN DEMO
DELETE FROM CONDITION_REPORTS
WHERE checkin_id IN (
    SELECT c.checkin_id
    FROM CHECKINS c
    JOIN USERS u ON u.user_id = c.user_id
    WHERE u.email IN (
        'demo1@carispot.test',
        'demo2@carispot.test'
    )
);


-- MEMBUAT 20.000 DATA BARU
INSERT INTO CONDITION_REPORTS (
    checkin_id,
    user_id,
    place_id,
    crowd_level,
    socket_available,
    wifi_speed,
    wifi_mbps,
    created_at
)
WITH demo_checkins AS (
    SELECT
        c.checkin_id,
        c.user_id,
        c.place_id,
        ROW_NUMBER() OVER (
            ORDER BY c.checkin_id
        ) AS rn
    FROM CHECKINS c
    JOIN USERS u ON u.user_id = c.user_id
    WHERE u.email IN (
        'demo1@carispot.test',
        'demo2@carispot.test'
    )
),
numbers AS (
    SELECT LEVEL AS n
    FROM DUAL
    CONNECT BY LEVEL <= 20000
)
SELECT
    c.checkin_id,
    c.user_id,
    c.place_id,
    'SEPI',
    'Y',
    'CEPAT',
    25,
    SYSTIMESTAMP -
        NUMTODSINTERVAL(MOD(n.n - 1, 43200), 'MINUTE')
FROM numbers n
JOIN demo_checkins c
    ON c.rn = MOD(n.n - 1, 2) + 1;


COMMIT;


-- CEK JUMLAH DATA PENGUJIAN
SELECT COUNT(*) AS total_laporan
FROM CONDITION_REPORTS;


-- CEK DATA BERDASARKAN TEMPAT
SELECT
    p.place_name,
    COUNT(*) AS total_laporan
FROM CONDITION_REPORTS r
JOIN PLACES p ON p.place_id = r.place_id
GROUP BY p.place_name;
