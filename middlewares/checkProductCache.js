import createError from "http-errors";
import { scrapeSingleProduct } from "../lib/scrapeSingleProduct.js";
import ProductPrice from "../models/ProductPrice.js";

export async function checkProductCache(req, res, next) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return next(createError(400, 'Falta el parámetro "slug"'));
    }

    const cacheLimitDate  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // ultimos 7 dias

    // Busca el producto más reciente
    const recentProduct = await ProductPrice.findOne({
      slug,
      createdAt: { $gte: cacheLimitDate  },
    }).sort({ createdAt: -1 });

    if (recentProduct) {
      res.locals.product = recentProduct;
      return next();
    }

    // Si no hay producto reciente, scrapeamos
    const scrapedData = await scrapeSingleProduct(slug);

    // Validación mínima: si no hay título o el precio no es número positivo
    if (!scrapedData.title) {
      return next(
        createError(
          404,
          "Producto no encontrado, por favor introduzca el nombre correcto"
        )
      );
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
