import { getConnection } from "../config/database.js";

export async function createReport(req, res, next) {
  let connection;

  try {
    const {
      checkin_id,
      place_id,
      crowd_level,
      socket_available,
      wifi_speed,
      wifi_mbps
    } = req.body;

    if (
      !checkin_id ||
      !place_id ||
      !crowd_level ||
      !socket_available ||
      !wifi_speed
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua informasi laporan wajib diisi."
      });
    }

    if (!["SEPI", "SEDANG", "RAMAI"].includes(crowd_level)) {
      return res.status(400).json({
        success: false,
        message: "Tingkat keramaian tidak valid."
      });
    }

    if (!["Y", "N"].includes(socket_available)) {
      return res.status(400).json({
        success: false,
        message: "Informasi ketersediaan stop kontak tidak valid."
      });
    }

    if (!["LAMBAT", "SEDANG", "CEPAT"].includes(wifi_speed)) {
      return res.status(400).json({
        success: false,
        message: "Kategori kecepatan WiFi tidak valid."
      });
    }

    if (
      wifi_mbps !== undefined &&
      wifi_mbps !== null &&
      (!Number.isFinite(Number(wifi_mbps)) || Number(wifi_mbps) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Kecepatan WiFi harus berupa angka positif."
      });
    }

    connection = await getConnection();

    const activeCheckin = await connection.execute(
      `SELECT checkin_id
       FROM CHECKINS
       WHERE checkin_id = :checkin_id
       AND user_id = :user_id
       AND place_id = :place_id
       AND checked_out_at IS NULL`,
      {
        checkin_id,
        user_id: req.user.user_id,
        place_id
      }
    );

    if (activeCheckin.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Kamu harus check-in aktif di tempat ini untuk melapor."
      });
    }

    const setting = await connection.execute(
      `SELECT setting_value
       FROM SETTINGS
       WHERE setting_key = 'REPORT_INTERVAL_MINUTES'`
    );

    const intervalMinutes = Number(
      setting.rows[0]?.SETTING_VALUE || 5
    );

    const recentReport = await connection.execute(
      `SELECT report_id
       FROM CONDITION_REPORTS
       WHERE user_id = :user_id
       AND place_id = :place_id
       AND created_at >= CURRENT_TIMESTAMP - NUMTODSINTERVAL(
         :interval_minutes,
         'MINUTE'
       )
       FETCH FIRST 1 ROW ONLY`,
      {
        user_id: req.user.user_id,
        place_id,
        interval_minutes: intervalMinutes
      }
    );

    if (recentReport.rows.length > 0) {
      return res.status(429).json({
        success: false,
        message: `Tunggu ${intervalMinutes} menit sebelum mengirim laporan berikutnya.`
      });
    }

    await connection.execute(
      `INSERT INTO CONDITION_REPORTS (
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
        :checkin_id,
        :user_id,
        :place_id,
        :crowd_level,
        :socket_available,
        :wifi_speed,
        :wifi_mbps,
        CURRENT_TIMESTAMP
      )`,
      {
        checkin_id,
        user_id: req.user.user_id,
        place_id,
        crowd_level,
        socket_available,
        wifi_speed,
        wifi_mbps: wifi_mbps ?? null
      }
    );

    await connection.execute(
      `INSERT INTO AUDIT_LOG (
        user_id,
        action_type,
        table_name,
        record_id,
        details,
        created_at
      )
      VALUES (
        :user_id,
        'CREATE_REPORT',
        'CONDITION_REPORTS',
        NULL,
        :details,
        CURRENT_TIMESTAMP
      )`,
      {
        user_id: req.user.user_id,
        details: `Laporan kondisi tempat ID ${place_id}`
      }
    );

    await connection.commit();

    const countResult = await connection.execute(
      `SELECT COUNT(DISTINCT user_id) AS reporter_count
       FROM CONDITION_REPORTS
       WHERE place_id = :place_id
       AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE`,
      { place_id }
    );

    const reporterCount = countResult.rows[0].REPORTER_COUNT;

    return res.status(201).json({
      success: true,
      message: "Laporan berhasil dikirim.",
      reporter_count: reporterCount,
      condition_verified: reporterCount >= 2
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

export async function getConditions(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
        p.place_id AS "place_id",
        p.place_name AS "place_name",
        r.crowd_level AS "crowd_level",
        r.socket_available AS "socket_available",
        r.wifi_speed AS "wifi_speed",
        r.wifi_mbps AS "wifi_mbps",
        r.created_at AS "created_at",
        (
          SELECT COUNT(DISTINCT r2.user_id)
          FROM CONDITION_REPORTS r2
          WHERE r2.place_id = p.place_id
          AND r2.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
        ) AS "report_count"
       FROM PLACES p
       JOIN CONDITION_REPORTS r
         ON r.place_id = p.place_id
       WHERE r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
       AND r.created_at = (
         SELECT MAX(r3.created_at)
         FROM CONDITION_REPORTS r3
         WHERE r3.place_id = p.place_id
         AND r3.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
       )
       AND (
         SELECT COUNT(DISTINCT r4.user_id)
         FROM CONDITION_REPORTS r4
         WHERE r4.place_id = p.place_id
         AND r4.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
       ) >= 2
       ORDER BY r.created_at DESC`
    );

    return res.json({
      success: true,
      conditions: result.rows
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}
