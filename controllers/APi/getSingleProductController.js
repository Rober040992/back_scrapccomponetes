import createError from "http-errors";

export async function getSingleProduct(req, res, next) {
  try {
    const slug = req.query.slug;
    if (!slug) {
      return next(createError(400, "Falta el parámetro slug"));
    }

    const product = res.locals.product;
    res.json(product);
  } catch (error) {
    next(error);
  }
}
