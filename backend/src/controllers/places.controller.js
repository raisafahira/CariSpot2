import { getConnection } from "../config/database.js";

export async function getPlaces(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
        p.place_id AS "place_id",
        p.category_id AS "category_id",
        c.category_name AS "category_name",
        p.place_name AS "place_name",
        p.address AS "address",
        p.description AS "description",
        p.latitude AS "latitude",
        p.longitude AS "longitude",
        (
          SELECT COUNT(DISTINCT r.user_id)
          FROM CONDITION_REPORTS r
          WHERE r.place_id = p.place_id
          AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
        ) AS "report_count",
        CASE
          WHEN (
            SELECT COUNT(DISTINCT r.user_id)
            FROM CONDITION_REPORTS r
            WHERE r.place_id = p.place_id
            AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
          ) >= 2
          THEN (
            SELECT r.crowd_level
            FROM CONDITION_REPORTS r
            WHERE r.place_id = p.place_id
            AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
            ORDER BY r.created_at DESC
            FETCH FIRST 1 ROW ONLY
          )
          ELSE NULL
        END AS "crowd_level",
        CASE
          WHEN (
            SELECT COUNT(DISTINCT r.user_id)
            FROM CONDITION_REPORTS r
            WHERE r.place_id = p.place_id
            AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
          ) >= 2
          THEN (
            SELECT r.socket_available
            FROM CONDITION_REPORTS r
            WHERE r.place_id = p.place_id
            AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
            ORDER BY r.created_at DESC
            FETCH FIRST 1 ROW ONLY
          )
          ELSE NULL
        END AS "socket_available",
        CASE
          WHEN (
            SELECT COUNT(DISTINCT r.user_id)
            FROM CONDITION_REPORTS r
            WHERE r.place_id = p.place_id
            AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
          ) >= 2
          THEN (
            SELECT r.wifi_speed
            FROM CONDITION_REPORTS r
            WHERE r.place_id = p.place_id
            AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
            ORDER BY r.created_at DESC
            FETCH FIRST 1 ROW ONLY
          )
          ELSE NULL
        END AS "wifi_speed",
        (
          SELECT r.wifi_mbps
          FROM CONDITION_REPORTS r
          WHERE r.place_id = p.place_id
          AND r.created_at >= CURRENT_TIMESTAMP - INTERVAL '30' MINUTE
          ORDER BY r.created_at DESC
          FETCH FIRST 1 ROW ONLY
        ) AS "wifi_mbps"
      FROM PLACES p
      LEFT JOIN CATEGORIES c
        ON c.category_id = p.category_id
      ORDER BY p.place_name`,
      {},
      { outFormat: 4002 }
    );

    return res.json({
      success: true,
      places: result.rows
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function getAvailablePlaces(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
        p.place_id AS "place_id",
        p.place_name AS "place_name",
        p.address AS "address",
        p.description AS "description",
        p.latitude AS "latitude",
        p.longitude AS "longitude",
        c.category_name AS "category_name"
       FROM PLACES p
       LEFT JOIN CATEGORIES c
         ON c.category_id = p.category_id
       ORDER BY p.place_name`
    );

    return res.json({
      success: true,
      places: result.rows
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
