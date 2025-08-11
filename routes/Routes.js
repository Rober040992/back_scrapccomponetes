import express from "express";
import { checkProductCache } from "../middlewares/checkProductCache.js";
import { getSingleProduct } from "../controllers/APi/getSingleProductController.js";
import { honeypotProtection, limitProductSearch } from "../middlewares/rate&honey.js";
import { getProductStatus } from "../controllers/API/getProductStatusController.js";
import { zodValidator } from "../middlewares/validate.js";
import { oneProductQuerySchema, productStatusParamsSchema } from "../validators/productSchemas.js";


const router = express.Router();

//sigle scrape
router.get(
  "/api/products/one",
  honeypotProtection,
  limitProductSearch,
  zodValidator(oneProductQuerySchema, 'query'),
  checkProductCache,
  getSingleProduct
);
// queue worker scrape
router.get(
  "/api/status/:slug",
  honeypotProtection,
  limitProductSearch,
  zodValidator(productStatusParamsSchema, 'params'),
  getProductStatus
);

export default router;
