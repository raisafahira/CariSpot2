import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import oracledb from "oracledb";
import { getConnection } from "../config/database.js";

export async function register(req, res, next) {
  let connection;

  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    connection = await getConnection();

    const existing = await connection.execute(
      `SELECT user_id
       FROM USERS
       WHERE LOWER(email) = :email`,
      { email: normalizedEmail }
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await connection.execute(
      `INSERT INTO USERS (
        full_name,
        email,
        password_hash,
        points,
        created_at
      )
      VALUES (
        :full_name,
        :email,
        :password_hash,
        0,
        CURRENT_TIMESTAMP
      )
      RETURNING user_id INTO :user_id`,
      {
        full_name: full_name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        user_id: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_OUT
        }
      }
    );

    await connection.commit();

    const userId = result.outBinds.user_id[0];

    const user = {
      user_id: userId,
      full_name: full_name.trim(),
      email: normalizedEmail,
      points: 0
    };

    const token = jwt.sign(
      {
        user_id: userId,
        email: normalizedEmail
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      token,
      user
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    next(error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function login(req, res, next) {
  let connection;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi."
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
        user_id,
        full_name,
        email,
        password_hash,
        points
       FROM USERS
       WHERE LOWER(email) = :email`,
      { email: email.trim().toLowerCase() }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah."
      });
    }

    const account = result.rows[0];

    const passwordValid = await bcrypt.compare(
      password,
      account.PASSWORD_HASH
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah."
      });
    }

    const token = jwt.sign(
      {
        user_id: account.USER_ID,
        email: account.EMAIL
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: {
        user_id: account.USER_ID,
        full_name: account.FULL_NAME,
        email: account.EMAIL,
        points: account.POINTS
      }
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
