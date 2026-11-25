-- =========================================
-- 06_VIEWS.SQL
-- VIEW CARI SPOT
-- =========================================


-- 1. VIEW KONDISI TERKINI
CREATE OR REPLACE VIEW v_kondisi_terkini AS
WITH setting_ttl AS (
    SELECT TO_NUMBER(setting_value) AS ttl
    FROM SETTINGS
    WHERE setting_key = 'REPORT_TTL_MINUTES'
),

recent_reports AS (
    SELECT r.*
    FROM CONDITION_REPORTS r
    CROSS JOIN setting_ttl s
    WHERE r.created_at >=
        SYSTIMESTAMP - NUMTODSINTERVAL(s.ttl, 'MINUTE')
),

quorum AS (
    SELECT
        place_id,
        COUNT(DISTINCT user_id) AS jumlah_pelapor
    FROM recent_reports
    GROUP BY place_id
    HAVING COUNT(DISTINCT user_id) >= 2
),

crowd_counts AS (
    SELECT place_id, crowd_level, COUNT(*) AS total
    FROM recent_reports
    GROUP BY place_id, crowd_level
),

crowd_rank AS (
    SELECT place_id, crowd_level,
           ROW_NUMBER() OVER (
               PARTITION BY place_id
               ORDER BY total DESC, crowd_level
           ) AS rn
    FROM crowd_counts
),

socket_counts AS (
    SELECT place_id, socket_available, COUNT(*) AS total
    FROM recent_reports
    GROUP BY place_id, socket_available
),

socket_rank AS (
    SELECT place_id, socket_available,
           ROW_NUMBER() OVER (
               PARTITION BY place_id
               ORDER BY total DESC, socket_available DESC
           ) AS rn
    FROM socket_counts
),

wifi_counts AS (
    SELECT place_id, wifi_speed, COUNT(*) AS total
    FROM recent_reports
    GROUP BY place_id, wifi_speed
),

wifi_rank AS (
    SELECT place_id, wifi_speed,
           ROW_NUMBER() OVER (
               PARTITION BY place_id
               ORDER BY total DESC, wifi_speed
           ) AS rn
    FROM wifi_counts
),

wifi_average AS (
    SELECT place_id, ROUND(AVG(wifi_mbps), 2) AS average_wifi_mbps
    FROM recent_reports
    GROUP BY place_id
)

SELECT
    p.place_id,
    p.place_name,
    p.address,
    cr.crowd_level,
    sr.socket_available,
    wr.wifi_speed,
    wa.average_wifi_mbps,
    q.jumlah_pelapor
FROM PLACES p
JOIN quorum q
    ON q.place_id = p.place_id
JOIN crowd_rank cr
    ON cr.place_id = p.place_id AND cr.rn = 1
JOIN socket_rank sr
    ON sr.place_id = p.place_id AND sr.rn = 1
JOIN wifi_rank wr
    ON wr.place_id = p.place_id AND wr.rn = 1
JOIN wifi_average wa
    ON wa.place_id = p.place_id;


-- 2. VIEW TEMPAT SEPI DAN ADA COLOKAN
CREATE OR REPLACE VIEW v_tempat_tersedia AS
SELECT *
FROM v_kondisi_terkini
WHERE crowd_level = 'SEPI'
  AND socket_available = 'Y';


SELECT * FROM v_kondisi_terkini;

SELECT * FROM v_tempat_tersedia;
