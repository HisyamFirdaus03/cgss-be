import { authenticate } from '@loopback/authentication'
import { repository } from '@loopback/repository'
import { get, HttpErrors, param, response } from '@loopback/rest'
import { generateDateRangesAnnually, JwtStrategy } from '../../common'
import { CompanyInfoRepository, ConfigurationRepository, GroupByRepository } from '../../repositories'
import { addDays, format } from 'date-fns'
import { delay } from '../../common/helpers'
// import { EnvConfig } from '../../configurations/secrets'
// import Redis from 'ioredis'
// const redis = new Redis()

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionDashboardController {
  constructor(
    @repository(GroupByRepository) private groupByRepository: GroupByRepository,
    @repository(CompanyInfoRepository) private companyInfoRepository: CompanyInfoRepository,
    @repository(ConfigurationRepository) private configurationRepository: ConfigurationRepository,
  ) {
  }

  @get('/dashboard/emission-intensity')
  @response(200, {
    description: 'This is for Emission intensity charts',
  })
  async emissionIntensity(
    @param.query.dateTime('from') from: Date,
    @param.query.dateTime('to') to: Date,
    @param.query.string('view') view: 'annually' | 'monthly' | 'quarterly',
    @param.array('groupByIds', 'query', { type: 'number' }) groupByIds: number[] = [],
    @param.query.boolean('useDebug') useDebug: boolean = false,
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
  ) {
    const financialYearStartMonth = await this.companyInfoRepository.getFinancialYearStartMonth(tenantId)
    const config = await this.configurationRepository.findFirst({ fields: ['activitiesStartFrom', 'defaultBaseline', 'optOutCalc'] })

    if (!config?.activitiesStartFrom) {
      throw new HttpErrors[500](`ActivitiesStartFrom empty, please set ActivitiesStartFrom first to continue`)
    }

    const isFY = format(addDays(from, 1), 'L') !== '1' // check FY or not by a day to `from`
    const MAX_EMISSION_INTENSITY_YEAR = 5
    const past5years = new Date().getFullYear() - MAX_EMISSION_INTENSITY_YEAR

    const ranges = generateDateRangesAnnually(
      // limit the `from` date
      Math.min(config.defaultBaseline, past5years),
      isFY,
      financialYearStartMonth,
    )

    const params = {
      db: `cgss_${tenantId}`,
      groupByIds,
      useDebug,
      financialYearStartMonth,
      from: ranges.at(0)!.from,
      to: ranges.at(-1)!.to,
      view: 'annually' as const,
      type: 'emissionIntensity' as const,
      isFY,
      config,
    }

    return this.groupByRepository.emissionsByScope(params)
  }

  @get('/dashboard/emission-by-scope')
  @response(200, {
    description: 'This is for Emission dashboard charts',
  })
  async emissionsByScope(
    @param.query.dateTime('from') from: Date,
    @param.query.dateTime('to') to: Date,
    @param.array('groupByIds', 'query', { type: 'number' }) groupByIds: number[] = [],
    @param.query.boolean('useDebug') useDebug: boolean = false,
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
  ) {
    // await delay(5000)
    const config = await this.configurationRepository.findFirst({ fields: ['activitiesStartFrom', 'defaultBaseline', 'optOutCalc'] })
    const db = `cgss_${tenantId}`
    const params = { db, groupByIds, from, to, useDebug, config, isFY: format(addDays(from, 1), 'L') !== '1' } as const
    const result = await this.groupByRepository.emissionsByScope(params)
    return result
  }

  @get('/dashboard/emission-by-widget')
  @response(200, {
    description: 'This is for Emission dashboard charts',
  })
  async emissionsByWidget(
    @param.query.dateTime('from') from: Date,
    @param.query.dateTime('to') to: Date,
    @param.array('groupByIds', 'query', { type: 'number' }) groupByIds: number[] = [],
    @param.query.boolean('useDebug') useDebug: boolean = false,
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
  ) {
    // await delay(5000000)
    const config = await this.configurationRepository.findFirst({ fields: ['activitiesStartFrom', 'defaultBaseline', 'optOutCalc'] })
    const db = `cgss_${tenantId}`
    const params = { db, groupByIds, from, to, useDebug, config, isFY: format(addDays(from, 1), 'L') !== '1' } as const
    const result = await this.groupByRepository.emissionsByWidget(params)
    return result
  }

  @get('/dashboard/emission-summary')
  @response(200, {
    description: 'This is for Emission dashboard summary',
  })
  async emissionsSummary(
    @param.array('groupByIds', 'query', { type: 'number' }) groupByIds: number[] = [],
    @param.query.boolean('useDebug') useDebug: boolean = false,
    @param.query.boolean('isFY') isFY: boolean = false,
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
  ) {
    const db = `cgss_${tenantId}`
    const config = await this.configurationRepository.findFirst({ fields: ['activitiesStartFrom', 'defaultBaseline', 'optOutCalc'] })
    const financialYearStartMonth = await this.companyInfoRepository.getFinancialYearStartMonth(tenantId)

    const ranges = generateDateRangesAnnually(config.activitiesStartFrom.getFullYear(), isFY, financialYearStartMonth)

    const params = { db, ranges, groupByIds, useDebug, config } as const
    return this.groupByRepository.emissionsSummary(params)
  }
}

