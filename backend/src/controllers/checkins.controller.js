import { getConnection } from "../config/database.js";

export async function getCheckins(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
        ci.checkin_id AS "checkin_id",
        ci.user_id AS "user_id",
        ci.place_id AS "place_id",
        p.place_name AS "place_name",
        p.address AS "address",
        ci.checked_in_at AS "checked_in_at",
        ci.checked_out_at AS "checked_out_at"
       FROM CHECKINS ci
       JOIN PLACES p ON p.place_id = ci.place_id
       WHERE ci.user_id = :user_id
       ORDER BY ci.checked_in_at DESC`,
      { user_id: req.user.user_id }
    );

    return res.json({
      success: true,
      checkins: result.rows
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function createCheckin(req, res, next) {
  let connection;

  try {
    const { place_id } = req.body;

    if (!place_id) {
      return res.status(400).json({
        success: false,
        message: "ID tempat wajib diisi."
      });
    }

    connection = await getConnection();

    const active = await connection.execute(
      `SELECT checkin_id
       FROM CHECKINS
       WHERE user_id = :user_id
       AND checked_out_at IS NULL`,
      { user_id: req.user.user_id }
    );

    if (active.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Kamu masih memiliki check-in aktif."
      });
    }

    const place = await connection.execute(
      `SELECT place_id
       FROM PLACES
       WHERE place_id = :place_id`,
      { place_id }
    );

    if (place.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tempat tidak ditemukan."
      });
    }

    const result = await connection.execute(
      `INSERT INTO CHECKINS (
        user_id,
        place_id,
        checked_in_at,
        checked_out_at
      )
      VALUES (
        :user_id,
        :place_id,
        CURRENT_TIMESTAMP,
        NULL
      )
      RETURNING checkin_id INTO :checkin_id`,
      {
        user_id: req.user.user_id,
        place_id,
        checkin_id: {
          type: 2010,
          dir: 3003
        }
      }
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Check-in berhasil.",
      checkin_id: result.outBinds.checkin_id[0]
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}

export async function checkout(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE CHECKINS
       SET checked_out_at = CURRENT_TIMESTAMP
       WHERE checkin_id = :checkin_id
       AND user_id = :user_id
       AND checked_out_at IS NULL`,
      {
        checkin_id: req.params.id,
        user_id: req.user.user_id
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Check-in aktif tidak ditemukan."
      });
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Check-out berhasil."
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) await connection.close();
  }
}
