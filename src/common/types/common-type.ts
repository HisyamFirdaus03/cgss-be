import { EmissionFactor } from '../../models'
import { EnvConfig } from '../../configurations/secrets'
import { Decimal } from 'decimal.js'

export type TOptimize = {
  groupByIds: number[]
  EF: EmissionFactor[]
  years: [fromYear: number, toYear: number]
  useDebug: boolean
}

export type BeforeTransform<T = unknown> = Partial<{
  pageIndex: number
  pageSize: number
  q: string
  sorting: { id: string; desc: 'true' | 'false' }[]
}> & {
  db: string
  groupByIds: number[]
  EF?: EmissionFactor[]
  dateRange: [from: Date, to: Date]
  useDebug: boolean
} & T

export type AfterTransformed<T = unknown> = Partial<{
  db: string
  groupByIds: string
  EF: EmissionFactor[]
  dateRange: [from: string, to: string]
  useDebug: boolean
  page: { limit: number; skip: number }
  q: string
  sorting: string
}> & T

const transformSorting = (sorts: BeforeTransform['sorting']): AfterTransformed['sorting'] => {
  if (!sorts || !Array.isArray(sorts)) {
    return undefined
  }

  return sorts.map((_) => `${_.id} ${_.desc === 'true' ? 'DESC' : 'ASC'}`).join(', ')
}

export const transformDateRange = ([from, to]: BeforeTransform['dateRange']): AfterTransformed['dateRange'] => {
  if (!from || !to) return undefined

  return [from.toISOString(), to.toISOString()] as any
}

export function transformPagination(pageIndex: number = 0, pageSize = 50): AfterTransformed['page'] {
  if (!(pageSize > 0 && pageIndex >= 0)) return undefined

  const skip = pageIndex * pageSize
  return { limit: pageSize, skip }
}

function transformGroupByIds(groupByIds: BeforeTransform['groupByIds']): AfterTransformed['groupByIds'] {
  if (!groupByIds || !Array.isArray(groupByIds)) {
    return undefined
  }

  return groupByIds.map((id) => `'${id}'`).join(',')
}

export function transformQueries<T>(params: BeforeTransform<T>): AfterTransformed<T> {
  const { groupByIds, dateRange, useDebug, pageIndex, pageSize, q, sorting, ...others } = params

  return {
    groupByIds: transformGroupByIds(groupByIds),
    useDebug: useDebug ?? EnvConfig.isDev,

    ...(params.dateRange ? { dateRange: transformDateRange(dateRange) } : {}),
    ...(others as T),
    ...(params.pageIndex || params.pageSize) ? ({ page: transformPagination(pageIndex, pageSize) }) : {},
    ...(params.q) ? ({ q }) : {},
    ...(params.sorting) ? ({ sorting: transformSorting(sorting) }) : {},
  }
}

export const transformSort = (sorts: { id: string; desc: 'true' | 'false' }[]) => {
  return sorts.map(({ id, desc }) => `${id} ${desc === 'true' ? 'desc' : 'asc'}`)
}

export type TActivity = {
  activities: {
    [year: string]: {
      [month: string]: Decimal
    }
  }
}
