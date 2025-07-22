import express from "express";
import { checkProductCache } from "../middlewares/checkProductCache.js";
import { getSingleProduct } from "../controllers/APi/getSingleProductController.js";
import {
  honeypotProtection,
  limitProductSearch,
} from "../middlewares/rate&honey.js";
import { getProductStatus } from "../controllers/API/getProductStatusController.js";

const router = express.Router();

//sigle scrape
router.get(
  "/api/products/one",
  honeypotProtection,
  limitProductSearch,
  checkProductCache,
  getSingleProduct
);
// queue worker scrape
router.get(
  "/api/status/:slug",
  honeypotProtection,
  limitProductSearch,
  getProductStatus
);

export default router;
