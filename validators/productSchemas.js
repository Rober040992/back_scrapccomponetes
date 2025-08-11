// Esquemas Zod para endpoints de productos (params, query y body futuro)
import { z } from 'zod'

export const slugSchema = z.object({
  slug: z.string()
    .trim()
    .toLowerCase()
    .min(3, 'slug demasiado corto')
    .max(120, 'slug demasiado largo')
    .regex(/^[a-z0-9-]+$/, 'slug inválido (usa a-z, 0-9 y guiones)')
})

export const oneProductQuerySchema = z.object({
  slug: slugSchema.shape.slug
})

export const productStatusParamsSchema = slugSchema

// FUTURO: creación de alerta de precios
export const createAlertBodySchema = z.object({
  slug: slugSchema.shape.slug,
  targetPrice: z.number().positive().max(99999),
  email: z.string().email()
})
