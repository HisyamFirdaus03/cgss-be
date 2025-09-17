import { Decimal } from 'decimal.js'

// @ts-ignore
export const kgToTon = (co2eActivities) =>
  Object.entries(co2eActivities).reduce((acc, [year, months]) => {
    // @ts-ignore
    Object.entries(months).forEach(([month, value]) => {
      // @ts-ignore
      acc[year][month] = value instanceof Decimal ? value.dividedBy(1000) : value
    })

    return acc
  }, co2eActivities)

export const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))
