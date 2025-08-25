export function buildPriceSeriesPipeline ({ slug, from, to, granularity }) {
  const tz = 'Europe/Madrid'

  // 1. Convertimos el campo `price` (string tipo "1.234,56 €") en número:
  const numericPrice = {
    $toDouble: {
      $replaceAll: {
        input: {
          $replaceAll: {
            input: {
              $replaceAll: {
                input: { $trim: { input: '$price' } }, // quita espacios
                find: '€', replacement: ''             // quita el símbolo €
              }
            },
            find: '.', replacement: ''                // quita separador de miles
          }
        },
        find: ',', replacement: '.'                   // convierte coma decimal en punto
      }
    }
  }

  return [
    // 2. Filtro por slug y rango de fechas
    { $match: { slug, createdAt: { $gte: new Date(from), $lte: new Date(to) } } },

    // 3. Proyectamos solo fecha y precio numérico
    { $project: { createdAt: 1, numericPrice } },

    // 4. Agrupamos por fecha truncada al día (puedes cambiar a 'week', 'month', 'year')
    {
      $group: {
        // permite day/month/year
        _id: { $dateTrunc: { date: '$createdAt', unit: granularity, timezone: tz } },
        value: { $avg: '$numericPrice' } // calculamos promedio del día
      }
    },

    // 5. Ordenamos cronológicamente
    { $sort: { _id: 1 } },

    // 6. Formateamos salida: fecha en string ISO y redondeamos valor a 2 decimales
    {
      $project: {
        _id: 0,
        bucket: { 
          $dateToString: { 
            date: '$_id', 
            format: '%Y-%m-%dT%H:%M:%S.%LZ', 
            timezone: 'UTC' 
          } 
        },
        value: { $round: ['$value', 2] }
      }
    }
  ]
}
