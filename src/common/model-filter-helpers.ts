import {
  addMonths,
  endOfMonth,
  endOfYear,
  format,
  isAfter,
  isWithinInterval,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { forOwn, get as _get, set, setWith } from 'lodash'
import { Decimal } from 'decimal.js'
import { TActivity } from '../common/types'

export const turnOfUserModifiableFields = {
  createdId: false,
  updatedId: false,
  deletedId: false,
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
}

/**
 * This kinda mess-up....  we should not minus - 1 here
 * @param year
 * @param month
 */
export const queryDataInMonthOf = (year: number, month: number) => {
  const startDay = startOfMonth(new Date(year, month - 1))
  const endDay = endOfMonth(new Date(year, month - 1))

  return [{ date: { gte: startDay } }, { date: { lte: endDay } }]
}

export const queryDataInYearOf = (year: number) => {
  const startDay = startOfYear(new Date(year, 0, 1)) // January is month 0
  const endDay = endOfYear(new Date(year, 11, 31)) // December is month 11

  return { and: [{ date: { gte: startDay } }, { date: { lte: endDay } }] }
}

export const queryDataInYearsOf = (fromYear: number, toYear: number) => {
  if (fromYear > toYear) {
    throw new Error('fromYear must be less than or equal to toYear')
  }

  const startDay = startOfYear(new Date(fromYear, 0, 1)) // Start of fromYear
  const endDay = endOfYear(new Date(toYear, 11, 31)) // End of toYear

  return { and: [{ date: { gte: startDay } }, { date: { lte: endDay } }] }
}

export function generateYearMonthRange([startDate, endDate]: [startDate: Date, endDate: Date]): Date[] {
  let start = new Date(startDate)
  const end = new Date(endDate)
  const result = []

  while (!isAfter(start, end)) {
    result.push(start)
    start = addMonths(start, 1)
  }

  return result // .slice(1, result.length)
}

export function generateDateRangesAnnually(
  startingFromYear: number,
  isFY: boolean,
  financialYearStartMonth = 1,
) {
  const currentDate = new Date()

  if (!isFY) financialYearStartMonth = 1

  // Determine the starting year
  const startYear = isFY ? startingFromYear - 1 : startingFromYear
  const endYear = currentDate.getFullYear()

  // Check if the current date is beyond the financial year start month
  const currentMonth = currentDate.getMonth() + 1 // 1-based
  const isAfterFiscalYearStart =
    currentMonth >= financialYearStartMonth ||
    (isFY && currentMonth === financialYearStartMonth)

  // Adjust the endYear based on the financial year and current date
  const adjustedEndYear = isAfterFiscalYearStart ? endYear + 1 : endYear

  const ranges = []
  let from = new Date(startYear, financialYearStartMonth - 1, 1) // Start date of the first range

  while (from.getFullYear() < adjustedEndYear) {
    const to = endOfMonth(addMonths(from, 12 - 1)) // Calculate the end date of the range
    ranges.push({ label: isFY ? `FY${to.getFullYear()}` : `${from.getFullYear()}`, from, to })
    from = addMonths(from, 12) // Move to the next financial year start
  }

  return ranges
}

export function isDateWithinRange(dateToCheck: Date, [from, to]: [from: Date, to: Date]): boolean {
  return isWithinInterval(dateToCheck, { start: from, end: to })
}

export const calcSummaryActivities =
  (ranges: ReturnType<typeof generateDateRangesAnnually>) =>
    (targetKey: string, activities: TActivity['activities'][]) => {
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i]

        forOwn(activity, (monthlyData, year) => {
          const _year = +year

          forOwn(monthlyData, (value, month) => {
            const _month = +month
            if (Number.isNaN(_month)) return

            const activityDate = new Date(_year, (_month) - 1, 1)
            const index = ranges.findIndex(({ from, to }) => isDateWithinRange(activityDate, [from, to]))

            if (index !== -1) {
              setWith(ranges[index], targetKey, _get(ranges[index], targetKey, new Decimal(0)).add(value))
            }
          })
        })
      }

      return ranges
    }

export const calcSummaryActivitiesFlatList =
  (ranges: ReturnType<typeof generateDateRangesAnnually>) =>
    (path: string, activities: { date: Date, co2e: Decimal }[]) => {
      activities.forEach(({ date, co2e }) => {
        const activityDate = new Date(date)
        const index = ranges.findIndex(({ from, to }) => isDateWithinRange(activityDate, [from, to]))

        if (index !== -1) {
          setWith(ranges[index], path, _get(ranges[index], path, new Decimal(0)).add(co2e))
        }
      })
    }

export type EmissionByScope = {
  entry: string
  scope1: { sc: Decimal; mc: Decimal; fe: Decimal; pe: Decimal }
  scope2: { heat: Decimal; cooling: Decimal; steam: Decimal; electric: Decimal }
  scope3: { ec: Decimal; bt: Decimal; up: Decimal; dw: Decimal, wg: Decimal }
  production: Decimal
}

export const snapshotEveryMonthFrom = ([from, to]: [Date, Date]) => {
  const map = new Map<string, EmissionByScope>()

  generateYearMonthRange([from, to]).forEach((dates) => {
    const entry = format(dates, 'yyyy-L')

    map.set(entry, {
      entry,
      scope1: { sc: new Decimal(0), mc: new Decimal(0), fe: new Decimal(0), pe: new Decimal(0) },
      scope2: { heat: new Decimal(0), cooling: new Decimal(0), steam: new Decimal(0), electric: new Decimal(0) },
      scope3: { ec: new Decimal(0), bt: new Decimal(0), up: new Decimal(0), dw: new Decimal(0), wg: new Decimal(0) },
      production: new Decimal(0),
    })
  })

  return map
}

/** aggregate into single map to render in charts */
export const accumulatorFor =
  (emissionPerScope: ReturnType<typeof snapshotEveryMonthFrom>) =>
    (targetKey: string, activities: TActivity['activities'][]) => {

      activities.forEach((activity) => {
        forOwn(activity, (monthlyData, year) => {
          forOwn(monthlyData, (value, month) => {
            if (Number.isNaN(+month)) return

            const path = `${year}-${month}`
            const prevValue = emissionPerScope.get(path)

            if (prevValue) {
              const nextValue = { ...prevValue }
              set(nextValue, targetKey, _get(prevValue, targetKey).add(value))

              emissionPerScope.set(path, nextValue)
            }
          })
        })
      })
    }


export const accumulatorFLatList = (emissionPerScope: ReturnType<typeof snapshotEveryMonthFrom>) =>
  (targetKey: string, list: ({ date: Date, co2e: Decimal })[]) => {
    list.forEach(({ date, co2e }) => {
      const d = new Date(date)
      const path = `${d.getFullYear()}-${d.getMonth() + 1}`
      const prevValue = emissionPerScope.get(path)

      if (prevValue) {
        const nextValue = { ...prevValue }
        set(nextValue, targetKey, _get(prevValue, targetKey).add(co2e))
        emissionPerScope.set(path, nextValue)
      }
    })
  }


