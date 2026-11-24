import express from "express";
import {
  createReport,
  getConditions
} from "../controllers/reports.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/conditions", authenticateToken, getConditions);
router.post("/", authenticateToken, createReport);

export default router;
