
export async function getSingleProduct(req, res, next) {
  try {
    const slug = req.query.slug;
    if (!slug) return res.status(400).json({ error: 'Falta el parámetro slug' });

    const product = res.locals.product;
    res.json(product);
  } catch (error) {
    next(error);
  }
}
