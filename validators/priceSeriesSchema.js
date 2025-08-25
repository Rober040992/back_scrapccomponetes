// [Propósito] Validación SIMPLE: slug requerido; rango opcional ISO; default último año.

import { z } from 'zod'

const iso = z.string().datetime({ offset: true }).optional()

export const seriesQuerySchema = z.object({
  slug: z.string().trim().toLowerCase().min(3),
  from: iso,
  to: iso,
  granularity: z.enum(['day', 'week', 'month', 'year']).default('week')

}).transform((v) => {
  const now = new Date()
  const from = v.from ? new Date(v.from) : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  const to = v.to ? new Date(v.to) : now
  if (from > to) throw new Error('"from" no puede ser posterior a "to"')
  return { ...v, from: from.toISOString(), to: to.toISOString() }
})
