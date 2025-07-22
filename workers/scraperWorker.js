import dotenv from 'dotenv';
dotenv.config();

import { Worker } from "bullmq";
import redis from "../lib/redisClient.js";
import { scrapeSingleProduct } from "../lib/scrapeSingleProduct.js";
import ProductPrice from "../models/ProductPrice.js";
import connectMongoose from "../lib/mongooseConfig.js";

await connectMongoose();

const scraperWorker = new Worker(
  'scraperQueue',
  async (job) => {
    const { slug } = job.data;

    const scraped = await scrapeSingleProduct(slug);

    if (scraped?.title && scraped?.price) {
      const exists = await ProductPrice.findOne({ slug });

      if (!exists) {
        await ProductPrice.create({ slug, ...scraped });
        console.log(`✅ Producto ${slug} guardado en DB`);
      } else {
        console.log(`ℹ️ Producto ${slug} ya existe. No se guarda de nuevo.`);
      }
    } else {
      console.warn(`❌ Scrape fallido para ${slug}`);
    }
  },
  { connection: redis }
);

scraperWorker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completado`);
});

scraperWorker.on('failed', (job, err) => {
  console.error(`💥 Job ${job.id} falló:`, err.message);
});