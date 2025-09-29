// SRP: Devuelve la lista deduplicada de slugs (base + descubiertos) que no han sido scrapeados esta semana

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import ProductPrice from '../../models/ProductPrice.js'

// Necesario para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Carga los slugs manuales desde baseSlugs.json
 */
async function loadBaseSlugs() {
  const slugsPath = path.join(__dirname, '..', 'baseSlugs.json')
  const raw = await fs.readFile(slugsPath, 'utf-8')
  return JSON.parse(raw)
}

/**
 * Devuelve todos los slugs únicos que deben ser encolados esta semana
 */
export async function getAllScrapableSlugs() {
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const baseSlugs = await loadBaseSlugs()
  const discoveredSlugs = await ProductPrice.distinct('slug')

  const allSlugs = Array.from(new Set([...baseSlugs, ...discoveredSlugs]))

  const recentlyScraped = await ProductPrice.find({
    slug: { $in: allSlugs },
    createdAt: { $gte: lastWeek },
  }).distinct('slug')

  const cleanSlugs = allSlugs.filter(slug => !recentlyScraped.includes(slug))
  
  // log de slugs base y en DDBB
  console.log({
  base: baseSlugs.length,
  db: discoveredSlugs.length,
  union: allSlugs.length,
  recent: recentlyScraped.length,
  final: cleanSlugs.length
})

  return cleanSlugs
}

