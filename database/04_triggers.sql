-- =========================================
-- 04_TRIGGERS.SQL
-- TRIGGER CARI SPOT
-- =========================================

-- 1. POINT_LOG TIDAK BOLEH DIUBAH ATAU DIHAPUS
CREATE OR REPLACE TRIGGER trg_point_log_immutable
BEFORE UPDATE OR DELETE ON POINT_LOG
BEGIN
    RAISE_APPLICATION_ERROR(
        -20001,
        'POINT_LOG tidak boleh diubah atau dihapus!'
    );
END;


-- 2. OTOMATIS MEMPERBARUI TOTAL POIN USERS
CREATE OR REPLACE TRIGGER trg_add_user_points
AFTER INSERT ON POINT_LOG
FOR EACH ROW
BEGIN
    UPDATE USERS
    SET points = points + :NEW.points_change
    WHERE user_id = :NEW.user_id;
END;


-- 3. AUDIT AKTIVITAS CHECKINS
CREATE OR REPLACE TRIGGER trg_audit_checkins
AFTER INSERT OR UPDATE ON CHECKINS
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO AUDIT_LOG (
            user_id, action_type, table_name,
            record_id, details, created_at
        )
        VALUES (
            :NEW.user_id, 'CHECKIN', 'CHECKINS',
            :NEW.checkin_id,
            'Pengguna melakukan check-in',
            SYSTIMESTAMP
        );
    ELSE
        INSERT INTO AUDIT_LOG (
            user_id, action_type, table_name,
            record_id, details, created_at
        )
        VALUES (
            :NEW.user_id, 'CHECKIN_UPDATE', 'CHECKINS',
            :NEW.checkin_id,
            'Data check-in diperbarui',
            SYSTIMESTAMP
        );
    END IF;
END;


-- 4. AUDIT LAPORAN KONDISI
CREATE OR REPLACE TRIGGER trg_audit_condition_reports
AFTER INSERT ON CONDITION_REPORTS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOG (
        user_id, action_type, table_name,
        record_id, details, created_at
    )
    VALUES (
        :NEW.user_id,
        'REPORT',
        'CONDITION_REPORTS',
        :NEW.report_id,
        'Pengguna mengirim laporan kondisi tempat',
        SYSTIMESTAMP
    );
END;

SELECT TRIGGER_NAME, STATUS
FROM USER_TRIGGERS
ORDER BY TRIGGER_NAME;
