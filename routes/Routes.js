import express from "express";
import { checkProductCache } from "../middlewares/checkProductCache.js";
import { getSingleProduct } from "../controllers/APi/getSingleProductController.js";
import {
  honeypotProtection,
  limitProductSearch,
} from "../middlewares/rate&honey.js";

const router = express.Router();

router.get(
  "/api/products/one",
  honeypotProtection,
  limitProductSearch,
  checkProductCache,
  getSingleProduct
);

export default router;
