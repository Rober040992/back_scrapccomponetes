// middlewares/checkProductCache.js
import { scrapeSingleProduct } from "../lib/scrapeSingleProduct.js";
import ProductPrice from "../models/ProductPrice.js";

export async function checkProductCache(req, res, next) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: 'Falta el parámetro "slug"' });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Busca el producto más reciente
    const recentProduct = await ProductPrice.findOne({
      slug,
      createdAt: { $gte: oneDayAgo },
    }).sort({ createdAt: -1 });

    if (recentProduct) {
      res.locals.product = recentProduct;
      return next();
    }

    // Si no hay producto reciente, scrapeamos
    const scrapedData = await scrapeSingleProduct(slug);

    // Validación mínima: si no hay título o el precio no es número positivo
    if (!scrapedData.title || scrapedData.price <= 0) {
      return res.status(404).json({
        error:
          "Producto no encontrado, por favor introduzca el nombre correcto",
      });
    }

    // solo se ejecuta si: El producto no está en MongoDB, O está, pero con más de 24 horas de antigüedad
    const newProduct = await ProductPrice.create(
      {
        slug,
        ...scrapedData,
      },
      console.log(" Poducto guardado en DB para cache ")
    );

    res.locals.product = newProduct;
    next();
  } catch (error) {
    next(error);
  }
}
