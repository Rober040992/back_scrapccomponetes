import createError from "http-errors";
import { scraperQueue } from "../queues/scraperQueue.js";
import ProductPrice from "../models/ProductPrice.js";

export async function checkProductCache(req, res, next) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return next(createError(400, 'Falta el parámetro "slug"'));
    }

    const cacheLimitDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // ultimos 7 dias

    // Busca el producto más reciente
    const recentProduct = await ProductPrice.findOne({
      slug,
      createdAt: { $gte: cacheLimitDate },
    }).sort({ createdAt: -1 });

    if (recentProduct) {
      res.locals.product = recentProduct;
      return next();
    }

    // Si no hay producto reciente, encola y espera (polling)
    await scraperQueue.add("scrape", { slug });

    // Polling: espera hasta 20s a que el producto aparezca en la DB
    const maxWaitMs = 20000;
    const pollIntervalMs = 1000;
    let waited = 0;
    let product = null;
    while (waited < maxWaitMs) {
      product = await ProductPrice.findOne({
        slug,
        createdAt: { $gte: cacheLimitDate },
      }).sort({ createdAt: -1 });
      if (product) break;
      await new Promise(r => setTimeout(r, pollIntervalMs));
      waited += pollIntervalMs;
    }

    if (product) {
      res.locals.product = product;
      return next();
    } else {
      res.status(202).json({
        message: "Producto encolado para scrapeo. Prueba en unos minutos.",
        slug,
      });
      return;
    }
  } catch (error) {
    next(error);
  }
}
