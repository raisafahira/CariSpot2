import express from "express";
import { getPoints } from "../controllers/points.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getPoints);

export default router;
