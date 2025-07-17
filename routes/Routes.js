import express from 'express';
import { getSingleProduct } from '../controllers/APi/singleProductController.js';

const router = express.Router();

router.get('/api/products/one', getSingleProduct);


export default router;