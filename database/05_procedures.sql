-- =========================================
-- 05_PROCEDURES.SQL
-- STORED PROCEDURE CARI SPOT
-- =========================================


-- 1. PROCEDURE MELAPORKAN KONDISI
CREATE OR REPLACE PROCEDURE sp_laporkan_kondisi (
    p_user_id IN NUMBER,
    p_place_id IN NUMBER,
    p_crowd_level IN VARCHAR2,
    p_socket_available IN CHAR,
    p_wifi_speed IN VARCHAR2,
    p_wifi_mbps IN NUMBER
)
AS
    v_checkin_id NUMBER;
    v_last_report TIMESTAMP;
    v_min_interval NUMBER;
    v_point_report NUMBER;
BEGIN
    -- Memastikan pengguna memiliki check-in aktif
    SELECT checkin_id
    INTO v_checkin_id
    FROM CHECKINS
    WHERE user_id = p_user_id
      AND place_id = p_place_id
      AND checked_out_at IS NULL
    FOR UPDATE;

    -- Membaca pengaturan interval laporan
    SELECT TO_NUMBER(setting_value)
    INTO v_min_interval
    FROM SETTINGS
    WHERE setting_key = 'MIN_REPORT_INTERVAL';

    -- Mengecek laporan terakhir pengguna pada tempat tersebut
    SELECT MAX(created_at)
    INTO v_last_report
    FROM CONDITION_REPORTS
    WHERE user_id = p_user_id
      AND place_id = p_place_id;

    IF v_last_report IS NOT NULL THEN
        IF (
            CAST(SYSTIMESTAMP AS DATE) -
            CAST(v_last_report AS DATE)
        ) * 1440 < v_min_interval THEN
            RAISE_APPLICATION_ERROR(
                -20002,
                'Tunggu sebelum mengirim laporan berikutnya!'
            );
        END IF;
    END IF;

    -- Membaca poin laporan
    SELECT TO_NUMBER(setting_value)
    INTO v_point_report
    FROM SETTINGS
    WHERE setting_key = 'POINT_REPORT';

    -- Menyimpan laporan
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
    VALUES (
        v_checkin_id,
        p_user_id,
        p_place_id,
        p_crowd_level,
        p_socket_available,
        p_wifi_speed,
        p_wifi_mbps,
        SYSTIMESTAMP
    );

    -- Memberikan poin laporan
    INSERT INTO POINT_LOG (
        user_id,
        points_change,
        description
    )
    VALUES (
        p_user_id,
        v_point_report,
        'Poin karena mengirim laporan kondisi'
    );

END;



-- 2. PROCEDURE CHECKOUT
CREATE OR REPLACE PROCEDURE sp_checkout (
    p_user_id IN NUMBER,
    p_checkin_id IN NUMBER
)
AS
    v_checked_in_at TIMESTAMP;
    v_checked_out_at TIMESTAMP;
    v_min_checkout NUMBER;
    v_point_checkout NUMBER;
BEGIN
    -- Mengunci dan memeriksa data check-in
    SELECT checked_in_at, checked_out_at
    INTO v_checked_in_at, v_checked_out_at
    FROM CHECKINS
    WHERE checkin_id = p_checkin_id
      AND user_id = p_user_id
    FOR UPDATE;

    IF v_checked_out_at IS NOT NULL THEN
        RAISE_APPLICATION_ERROR(
            -20003,
            'Check-in sudah ditutup sebelumnya!'
        );
    END IF;

    -- Membaca durasi minimal checkout
    SELECT TO_NUMBER(setting_value)
    INTO v_min_checkout
    FROM SETTINGS
    WHERE setting_key = 'MIN_CHECKOUT_MINUTES';

    IF (
        CAST(SYSTIMESTAMP AS DATE) -
        CAST(v_checked_in_at AS DATE)
    ) * 1440 < v_min_checkout THEN
        RAISE_APPLICATION_ERROR(
            -20004,
            'Durasi check-in belum mencapai batas minimal!'
        );
    END IF;

    -- Membaca poin checkout
    SELECT TO_NUMBER(setting_value)
    INTO v_point_checkout
    FROM SETTINGS
    WHERE setting_key = 'POINT_CHECKOUT';

    -- Menutup check-in
    UPDATE CHECKINS
    SET checked_out_at = SYSTIMESTAMP
    WHERE checkin_id = p_checkin_id;

    -- Memberikan poin checkout
    INSERT INTO POINT_LOG (
        user_id,
        points_change,
        description
    )
    VALUES (
        p_user_id,
        v_point_checkout,
        'Poin karena melakukan checkout'
    );

END;

SELECT OBJECT_NAME, STATUS
FROM USER_OBJECTS
WHERE OBJECT_TYPE = 'PROCEDURE'
ORDER BY OBJECT_NAME;

