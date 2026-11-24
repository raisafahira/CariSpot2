import { getConnection } from "../config/database.js";

export async function getPoints(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const userResult = await connection.execute(
      `SELECT points
       FROM USERS
       WHERE user_id = :user_id`,
      { user_id: req.user.user_id }
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan."
      });
    }

    const historyResult = await connection.execute(
      `SELECT
        point_log_id AS "point_log_id",
        points_change AS "points_change",
        description AS "description",
        created_at AS "created_at"
       FROM POINT_LOG
       WHERE user_id = :user_id
       ORDER BY created_at DESC`,
      { user_id: req.user.user_id }
    );

    return res.json({
      success: true,
      total_points: userResult.rows[0].POINTS,
      history: historyResult.rows
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}
