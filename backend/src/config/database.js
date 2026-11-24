import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool;

export async function connectDatabase() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1
    });

    console.log("Berhasil terhubung ke database Oracle.");
  } catch (error) {
    console.error("Gagal menghubungkan database:", error);
    throw error;
  }
}

export async function getConnection() {
  if (!pool) {
    throw new Error("Database pool belum dibuat.");
  }

  return pool.getConnection();
}

export async function closeDatabase() {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log("Koneksi database ditutup.");
  }
}
