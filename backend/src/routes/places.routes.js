import express from "express";
import {
  getPlaces,
  getAvailablePlaces
} from "../controllers/places.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPlaces);
router.get("/available", authenticateToken, getAvailablePlaces);

export default router;
