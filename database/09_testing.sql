-- =========================================
-- 09_EXPLAIN_PLAN.SQL
-- PENGUJIAN INDEX DAN EXPLAIN PLAN
-- =========================================


-- MENGUMPULKAN STATISTIK TABEL
BEGIN
    DBMS_STATS.GATHER_TABLE_STATS(
        USER,
        'CONDITION_REPORTS'
    );
END;
/


-- =========================================
-- A. EXPLAIN PLAN TANPA INDEX
-- =========================================

DROP INDEX idx_reports_place_date;

BEGIN
    DBMS_STATS.GATHER_TABLE_STATS(
        USER,
        'CONDITION_REPORTS'
    );
END;
/

EXPLAIN PLAN SET STATEMENT_ID = 'TANPA_INDEX'
FOR
SELECT *
FROM CONDITION_REPORTS
WHERE place_id = (
    SELECT place_id
    FROM PLACES
    WHERE place_name = 'Cafe Demo'
)
AND created_at >=
    SYSTIMESTAMP - INTERVAL '30' MINUTE;


SELECT *
FROM TABLE(
    DBMS_XPLAN.DISPLAY(
        NULL,
        'TANPA_INDEX',
        'BASIC +COST +ROWS'
    )
);


-- =========================================
-- B. MEMBUAT KEMBALI INDEX
-- =========================================

CREATE INDEX idx_reports_place_date
ON CONDITION_REPORTS(place_id, created_at);

BEGIN
    DBMS_STATS.GATHER_TABLE_STATS(
        USER,
        'CONDITION_REPORTS'
    );
END;
/


-- =========================================
-- C. EXPLAIN PLAN DENGAN INDEX
-- =========================================

EXPLAIN PLAN SET STATEMENT_ID = 'DENGAN_INDEX'
FOR
SELECT *
FROM CONDITION_REPORTS
WHERE place_id = (
    SELECT place_id
    FROM PLACES
    WHERE place_name = 'Cafe Demo'
)
AND created_at >=
    SYSTIMESTAMP - INTERVAL '30' MINUTE;


SELECT *
FROM TABLE(
    DBMS_XPLAN.DISPLAY(
        NULL,
        'DENGAN_INDEX',
        'BASIC +COST +ROWS'
    )
);
