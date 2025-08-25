import dotenv from 'dotenv';
dotenv.config();

import { Worker } from "bullmq";
import redis from "../lib/redisClient.js";
import { scrapeSingleProduct } from "../lib/scrapeSingleProduct.js";
import ProductPrice from "../models/ProductPrice.js";
import connectMongoose from "../lib/mongooseConfig.js";

// para iniciar el worker necesito acceso a la DB
await connectMongoose();

const scraperWorker = new Worker(
  'scraperQueue',
  async (job) => {
    const { slug } = job.data;
    // ejecutamos el scraper real
    const scraped = await scrapeSingleProduct(slug);

    if (scraped?.title && scraped?.price) {
      // ✅ Siempre guarda un nuevo documento (crea histórico)
      await ProductPrice.create({ slug, ...scraped });
      console.log(`✅ Snapshot de ${slug} guardado en DB`);
    } else {
      console.warn(`❌ Scrape fallido para ${slug}`);
    }
  },
  { connection: redis }
);
// Logging de eventos del worker
scraperWorker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completado`);
});

scraperWorker.on('failed', (job, err) => {
  console.error(`💥 Job ${job.id} falló:`, err.message);
});