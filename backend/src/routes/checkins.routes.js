import express from "express";
import {
  getCheckins,
  createCheckin,
  checkout
} from "../controllers/checkins.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getCheckins);
router.post("/", createCheckin);
router.post("/:id/checkout", checkout);

export default router;
