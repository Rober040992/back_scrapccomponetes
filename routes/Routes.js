import express from 'express';
import { checkProductCache } from '../middlewares/checkProductCache.js';
import { getSingleProduct } from '../controllers/APi/getSingleProductController.js';

const router = express.Router();

router.get('/api/products/one', checkProductCache, getSingleProduct);

export default router;