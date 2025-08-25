// [Propósito] Endpoint SIMPLE para series de precios por slug (avg diario).
// [Notas] Valida con Zod, errores con http-errors, usa agregación del pipeline en ProductPrice.

import createError from 'http-errors'
import ProductPrice from '../../models/ProductPrice.js'
import { seriesQuerySchema } from '../../validators/priceSeriesSchema.js'
import { buildPriceSeriesPipeline } from '../../lib/buildPriceSeriesPipeline.js'

export async function getPriceSeries(req, res, next) {
  try {
    // Validación mínima y segura
    const parsed = seriesQuerySchema.parse({
      slug: req.params.slug,
      from: req.query.from,
      to: req.query.to,
      granularity: req.query.granularity
    })

    const pipeline = buildPriceSeriesPipeline(parsed)
    const docs = await ProductPrice.aggregate(pipeline)

    if (!docs.length) return next(createError(404, 'Sin datos para este rango'))

    res.json({
      slug: parsed.slug,
      from: parsed.from,
      to: parsed.to,
      granularity: parsed.granularity,
      points: docs.map(d => ({ date: d.bucket, value: d.value }))
    })
  } catch (err) {
    if (err?.issues) return next(createError(400, err.issues.map(i => i.message).join(', ')))
    next(err)
  }
}
