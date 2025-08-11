// Tests básicos (Node.js test runner nativo) para esquemas Zod
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { oneProductQuerySchema, productStatusParamsSchema } from '../validators/productSchemas.js'

test('oneProductQuerySchema acepta slug válido', () => {
  const { success } = oneProductQuerySchema.safeParse({ slug: 'ryzen-7-7800x3d' })
  assert.equal(success, true)
})

test('oneProductQuerySchema rechaza slug inválido', () => {
  const { success } = oneProductQuerySchema.safeParse({ slug: 'BAD SLUG!!' })
  assert.equal(success, false)
})

test('productStatusParamsSchema normaliza y valida', () => {
  const res = productStatusParamsSchema.safeParse({ slug: '  RTX-4070-ti  ' })
  assert.equal(res.success, true)
  assert.equal(res.data.slug, 'rtx-4070-ti') // trim + lower
})