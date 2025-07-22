import ProductPrice from "../../models/ProductPrice.js";
import createError from "http-errors";

export async function getProductStatus(req, res, next) {
  try {
    const { slug } = req.params;
    const product = await ProductPrice.findOne({ slug }).sort({
      createdAt: -1,
    });

    if (!product) {
      return next(createError(404, "Producto no encontrado"));
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}
