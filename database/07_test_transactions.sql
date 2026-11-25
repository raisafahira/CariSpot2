-- =========================================
-- 07_TEST_TRANSACTIONS.SQL
-- PENGUJIAN COMMIT DAN ROLLBACK
-- =========================================

-- CEK POIN SEBELUM PENGUJIAN
SELECT user_id, full_name, points
FROM USERS
WHERE email = 'demo1@carispot.test';


-- PENGUJIAN ROLLBACK
SAVEPOINT sebelum_uji;

INSERT INTO POINT_LOG (
    user_id,
    points_change,
    description
)
SELECT
    user_id,
    99,
    'Pengujian ROLLBACK'
FROM USERS
WHERE email = 'demo1@carispot.test';

-- Membatalkan penambahan poin
ROLLBACK TO sebelum_uji;

-- Menyelesaikan transaksi
COMMIT;


-- CEK POIN SETELAH ROLLBACK
SELECT user_id, full_name, points
FROM USERS
WHERE email = 'demo1@carispot.test';


-- PENGUJIAN COMMIT
INSERT INTO POINT_LOG (
    user_id,
    points_change,
    description
)
SELECT
    user_id,
    1,
    'Pengujian COMMIT'
FROM USERS
WHERE email = 'demo1@carispot.test';

COMMIT;


-- CEK HASIL COMMIT
SELECT
    u.full_name,
    u.points,
    p.description,
    p.points_change
FROM USERS u
JOIN POINT_LOG p ON p.user_id = u.user_id
WHERE u.email = 'demo1@carispot.test'
ORDER BY p.point_log_id;
