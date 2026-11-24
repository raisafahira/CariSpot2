import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDatabase, closeDatabase } from "./config/database.js";

import authRoutes from "./routes/auth.routes.js";
import placesRoutes from "./routes/places.routes.js";
import checkinsRoutes from "./routes/checkins.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import pointsRoutes from "./routes/points.routes.js";

import { authenticateToken } from "./middleware/auth.middleware.js";
import { getConditions } from "./controllers/reports.controller.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Cari Spot berjalan."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/checkins", checkinsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/points", pointsRoutes);

// Menyesuaikan endpoint yang dipakai frontend:
// reportAPI.getAll() -> GET /api/conditions
app.get("/api/conditions", authenticateToken, getConditions);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan."
  });
});

app.use(errorHandler);

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(PORT, () => {
      console.log(`Backend Cari Spot berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend gagal dijalankan:", error);
    process.exit(1);
  }
}

async function shutdown() {
  console.log("Menutup server Cari Spot...");

  if (server) {
    server.close();
  }

  try {
    await closeDatabase();
  } catch (error) {
    console.error("Gagal menutup koneksi database:", error);
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
