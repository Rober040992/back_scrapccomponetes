// SRP: Configura y ejecuta el cron job para scrapeo semanal

import cron from 'node-cron'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { scraperQueue } from '../queues/scraperQueue.js'
import { getAllScrapableSlugs } from './helpers/getAllScrapableSlugs.js'

dotenv.config()

/**
 * Ejecuta el proceso de scrapeo semanal de productos
 */
export async function runWeeklyScraper() {
  try {
    console.log('[CRON] Iniciando scrapeo semanal...')

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI)
    }

    const slugsToScrape = await getAllScrapableSlugs()

    console.log(`[CRON] Slugs encontrados: ${slugsToScrape.length}`)

    for (let i = 0; i < slugsToScrape.length; i++) {
      const slug = slugsToScrape[i]

      await scraperQueue.add(
        'scrape',
        { slug },
        {
          delay: i * 20000, // 1 cada 20s
          removeOnComplete: true,
          removeOnFail: true,
        }
      )

      console.log(`[CRON] Encolado: ${slug}`)
    }

    console.log('[CRON] Encolado completado.')

  } catch (err) {
    console.error('[CRON] Error durante el scrapeo semanal:', err)
  }
}

// Se ejecuta todos los lunes a las 03:00am
cron.schedule('0 3 * * 1', () => {
  runWeeklyScraper()
})
// Ejecutar inmediatamente si se lanza manualmente con `npm run`
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('weeklyScraper.js')) {
  runWeeklyScraper()
}
