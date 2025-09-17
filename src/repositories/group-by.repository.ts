import { Constructor, Getter, inject } from '@loopback/core'
import { DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { chunk, get as _get, groupBy as _groupBy, map } from 'lodash'
import {
  accumulatorFLatList,
  accumulatorFor,
  calcSummaryActivities,
  calcSummaryActivitiesFlatList,
  type EmissionByScope,
  generateDateRangesAnnually,
  snapshotEveryMonthFrom,
  TActivity,
  transformDateRange,
} from '../common'
import { DatabaseConfig } from '../configurations/secrets'
import { DemoDataSource } from '../datasources'
import {
  Configuration,
  EmissionProduction,
  EmissionScope1FugitiveEmission,
  EmissionScope1MobileCombustion,
  EmissionScope1ProcessEmission,
  EmissionScope1StationaryCombustion,
  EmissionScope2,
  EmissionScope3BusinessTravel,
  EmissionScope3EmployeeCommuting,
  EmissionScope3UpstreamDownstreamTransportationAndDistribution,
  EmissionScope3WasteGenerated,
  GroupBy,
  GroupByRelations,
} from '../models'
import {
  EmissionProductionRepository,
  EmissionScope1FugitiveEmissionRepository,
  EmissionScope1MobileCombustionRepository,
  EmissionScope1ProcessEmissionRepository,
  EmissionScope1StationaryCombustionRepository,
  EmissionScope2Repository,
  EmissionScope3BusinessTravelRepository,
  EmissionScope3EmployeeCommutingRepository,
  EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository,
  EmissionScope3WasteGeneratedRepository,
  TimeStampRepositoryMixin,
  UserRepository,
} from '../repositories'

type GroupById = typeof GroupBy.prototype.id

export class GroupByRepository extends TimeStampRepositoryMixin<
  GroupBy,
  typeof GroupBy.prototype.id,
  Constructor<DefaultCrudRepository<GroupBy, typeof GroupBy.prototype.id, GroupByRelations>>
>(DefaultCrudRepository) {
  public readonly emissionScope1FugitiveEmissions: HasManyRepositoryFactory<EmissionScope1FugitiveEmission, GroupById>
  public readonly emissionScope1MobileCombustions: HasManyRepositoryFactory<EmissionScope1MobileCombustion, GroupById>
  public readonly emissionScope1ProcessEmissions: HasManyRepositoryFactory<EmissionScope1ProcessEmission, GroupById>
  public readonly emissionScope1StationaryCombustions: HasManyRepositoryFactory<EmissionScope1StationaryCombustion, GroupById>

  public readonly emissionScope2s: HasManyRepositoryFactory<EmissionScope2, GroupById>

  public readonly emissionScope3EmployeeCommuting: HasManyRepositoryFactory<EmissionScope3EmployeeCommuting, GroupById>
  public readonly emissionScope3BusinessTravels: HasManyRepositoryFactory<EmissionScope3BusinessTravel, GroupById>
  public readonly emissionScope3Udtds: HasManyRepositoryFactory<EmissionScope3UpstreamDownstreamTransportationAndDistribution, GroupById>
  public readonly emissionScope3WasteGenerated: HasManyRepositoryFactory<EmissionScope3WasteGenerated, GroupById>

  public readonly emissionProductions: HasManyRepositoryFactory<EmissionProduction, GroupById>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('UserRepository') userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('EmissionScope1FugitiveEmissionRepository')
    protected emissionScope1FugitiveEmissionGetter: Getter<EmissionScope1FugitiveEmissionRepository>,
    @repository.getter('EmissionScope1MobileCombustionRepository')
    protected emissionScope1MobileCombustionGetter: Getter<EmissionScope1MobileCombustionRepository>,
    @repository.getter('EmissionScope1ProcessEmissionRepository')
    protected emissionScope1ProcessEmissionGetter: Getter<EmissionScope1ProcessEmissionRepository>,
    @repository.getter('EmissionScope1StationaryCombustionRepository')
    protected emissionScope1StationaryCombustionGetter: Getter<EmissionScope1StationaryCombustionRepository>,
    @repository.getter('EmissionScope2Repository')
    protected emissionScope2Getter: Getter<EmissionScope2Repository>,
    @repository.getter('EmissionScope3EmployeeCommutingRepository')
    protected emissionScope3EmployeeCommutingGetter: Getter<EmissionScope3EmployeeCommutingRepository>,
    @repository.getter('EmissionScope3BusinessTravelRepository')
    protected emissionScope3BusinessTravelGetter: Getter<EmissionScope3BusinessTravelRepository>,
    @repository.getter('EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository')
    protected emissionScope3UdtdGetter: Getter<EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository>,
    @repository.getter('EmissionScope3WasteGeneratedRepository')
    protected emissionScope3WasteGeneratedGetter: Getter<EmissionScope3WasteGeneratedRepository>,
    @repository.getter('EmissionProductionRepository')
    protected emissionProductionGetter: Getter<EmissionProductionRepository>,
  ) {
    super(GroupBy, dataSource, userRepositoryGetter)

    // prettier-ignore
    this.emissionScope1FugitiveEmissions = this.createHasManyRepositoryFactoryFor('emissionScope1FugitiveEmissions', emissionScope1FugitiveEmissionGetter)
    this.registerInclusionResolver('emissionScope1FugitiveEmissions', this.emissionScope1FugitiveEmissions.inclusionResolver)

    // prettier-ignore
    this.emissionScope1MobileCombustions = this.createHasManyRepositoryFactoryFor('emissionScope1MobileCombustions', emissionScope1MobileCombustionGetter)
    this.registerInclusionResolver('emissionScope1MobileCombustions', this.emissionScope1MobileCombustions.inclusionResolver)

    // prettier-ignore
    this.emissionScope1ProcessEmissions = this.createHasManyRepositoryFactoryFor('emissionScope1ProcessEmissions', emissionScope1ProcessEmissionGetter)
    this.registerInclusionResolver('emissionScope1ProcessEmissions', this.emissionScope1ProcessEmissions.inclusionResolver)

    // prettier-ignore
    this.emissionScope1StationaryCombustions = this.createHasManyRepositoryFactoryFor('emissionScope1StationaryCombustions', emissionScope1StationaryCombustionGetter)
    this.registerInclusionResolver('emissionScope1StationaryCombustions', this.emissionScope1StationaryCombustions.inclusionResolver)

    this.emissionScope2s = this.createHasManyRepositoryFactoryFor('emissionScope2s', emissionScope2Getter)
    this.registerInclusionResolver('emissionScope2s', this.emissionScope2s.inclusionResolver)

    // prettier-ignore
    this.emissionScope3EmployeeCommuting = this.createHasManyRepositoryFactoryFor('emissionScope3EmployeeCommuting', emissionScope3EmployeeCommutingGetter)
    this.registerInclusionResolver('emissionScope3EmployeeCommuting', this.emissionScope3EmployeeCommuting.inclusionResolver)

    // prettier-ignore
    this.emissionScope3BusinessTravels = this.createHasManyRepositoryFactoryFor('emissionScope3BusinessTravels', emissionScope3BusinessTravelGetter)
    this.registerInclusionResolver('emissionScope3BusinessTravels', this.emissionScope3BusinessTravels.inclusionResolver)

    this.emissionScope3Udtds = this.createHasManyRepositoryFactoryFor('emissionScope3Udtds', emissionScope3UdtdGetter)
    this.registerInclusionResolver('emissionScope3Udtds', this.emissionScope3Udtds.inclusionResolver)

    this.emissionScope3WasteGenerated = this.createHasManyRepositoryFactoryFor('emissionScope3WasteGenerated', emissionScope3WasteGeneratedGetter)
    this.registerInclusionResolver('emissionScope3WasteGenerated', this.emissionScope3WasteGenerated.inclusionResolver)

    this.emissionProductions = this.createHasManyRepositoryFactoryFor('emissionProductions', emissionProductionGetter)
    this.registerInclusionResolver('emissionProductions', this.emissionProductions.inclusionResolver)
  }

  async emissionsByScope({
                           db,
                           from,
                           to,
                           isFY,
                           groupByIds,
                           useDebug = false,
                           view = 'monthly',
                           financialYearStartMonth = 1,
                           type = 'emissionByScope',
                           config,
                         }: {
    db: string,
    from: Date
    to: Date
    useDebug: boolean
    groupByIds: number[]
    type?: 'emissionByScope' | 'emissionIntensity'
    view?: 'annually' | 'quarterly' | 'monthly'
    isFY: boolean
    financialYearStartMonth?: undefined | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    config: Omit<Configuration, 'id'>
  }): Promise<EmissionByScope[]> {
    // from = new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0))
    const payload = { db, dateRange: [from, to] as [Date, Date], useDebug, groupByIds }

    const emissionPerScope = snapshotEveryMonthFrom([from, to])
    const _accumulatorFor = accumulatorFor(emissionPerScope)
    const _accumulatorFLatList = accumulatorFLatList(emissionPerScope)
    const query = collect(payload)

    const OptOutCalc = async (key: keyof Configuration['optOutCalc'], promise: () => Promise<unknown>) => config.optOutCalc?.[key] ? Promise.resolve() : promise()

    await Promise.all([
      query<TActivity, EmissionProductionRepository>(this.emissionProductionGetter).then(result => _accumulatorFor('production', result.map(pluckActivities))),

      // SCOPE 1
      query<TActivity, EmissionScope1StationaryCombustionRepository>(this.emissionScope1StationaryCombustionGetter).then(result => _accumulatorFor('scope1.sc', result.map(pluckActivities))),
      query<TActivity, EmissionScope1MobileCombustionRepository>(this.emissionScope1MobileCombustionGetter).then(result => _accumulatorFor('scope1.mc', result.map(pluckActivities))),
      query<TActivity, EmissionScope1ProcessEmissionRepository>(this.emissionScope1ProcessEmissionGetter).then(result => _accumulatorFor('scope1.pe', result.map(pluckActivities))),
      query<TActivity, EmissionScope1FugitiveEmissionRepository>(this.emissionScope1FugitiveEmissionGetter).then(result => _accumulatorFor('scope1.fe', result.map(pluckActivities))),

      // SCOPE 2
      query<TActivity & {
        type: 'heat' | 'cooling' | 'steam' | 'electric'
      }, EmissionScope2Repository>(this.emissionScope2Getter).then(result => {
        const grouped = _groupBy(result, 'type')
        _accumulatorFor('scope2.heat', map(_get(grouped, 'heat', []), 'activities'))
        _accumulatorFor('scope2.cooling', map(_get(grouped, 'cooling', []), 'activities'))
        _accumulatorFor('scope2.steam', map(_get(grouped, 'steam', []), 'activities'))
        _accumulatorFor('scope2.electric', map(_get(grouped, 'electric', []), 'activities'))
      }),

      //  SCOPE 3
      OptOutCalc('employee-commuting', () => query<TActivity, EmissionScope3EmployeeCommutingRepository>(this.emissionScope3EmployeeCommutingGetter).then(result => _accumulatorFor('scope3.ec', result.map(pluckActivities)))),
      OptOutCalc('waste-generated', () => query<TActivity, EmissionScope3WasteGeneratedRepository>(this.emissionScope3WasteGeneratedGetter).then(result => _accumulatorFor('scope3.wg', result.map(pluckActivities)))),
      query<{
        date: Date,
        co2e: Decimal
      }, EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository>(this.emissionScope3UdtdGetter).then(result => {
        const { upstream = [], downstream = [] } = _groupBy(result, 'type')
        if (!config.optOutCalc?.['upstream']) {
          _accumulatorFLatList('scope3.up', upstream)
        }

        if (!config.optOutCalc?.['downstream']) {
          _accumulatorFLatList('scope3.dw', downstream)
        }
      }),
      OptOutCalc('business-travel', () => query<{
        id: number,
        date: Date,
        co2e: Decimal
      }, EmissionScope3BusinessTravelRepository>(this.emissionScope3BusinessTravelGetter).then(result => _accumulatorFLatList('scope3.bt', result))),
    ])

    const _temp = Array.from(emissionPerScope.entries())

    /// kinda ugly for the time being
    /// this should be done at
    //     const emissionPerScope = snapshotEveryMonthFrom([from, to]) <-------
    //     const _accumulatorFor = accumulatorFor(emissionPerScope)
    //     const _accumulatorFLatList = accumulatorFLatList(emissionPerScope)
    // so in future if let say we want to group the calc by Quarter or yearly can avoid multiple looping
    return chunk(_temp, view === 'annually' ? 12 : 1).map((chuncked) => {
      return chuncked.reduce(
        (acc, c, i) => {
          const item = c[1]

          if (i === 0) {
            const [year, month] = item.entry.split('-')
            acc.entry = `${year}-${month}`

            if (view === 'annually') {
              if (type === 'emissionIntensity') {
                acc.entry = `${isFY ? 'FY' : ''}${format(new Date(+year + (isFY ? 1 : 0), (financialYearStartMonth ?? 1) - 1, 1), 'yyyy')}`
                // console.log('>>', acc.entry)
              }
            }
          }

          acc.scope1 = {
            sc: acc.scope1.sc.add(item.scope1.sc),
            mc: acc.scope1.mc.add(item.scope1.mc),
            fe: acc.scope1.fe.add(item.scope1.fe),
            pe: acc.scope1.pe.add(item.scope1.pe),
          }

          acc.scope2 = {
            heat: acc.scope2.heat.add(item.scope2.heat),
            cooling: acc.scope2.cooling.add(item.scope2.cooling),
            steam: acc.scope2.steam.add(item.scope2.steam),
            electric: acc.scope2.electric.add(item.scope2.electric),
          }

          acc.scope3 = {
            ec: acc.scope3.ec.add(item.scope3.ec),
            bt: acc.scope3.bt.add(item.scope3.bt),
            up: acc.scope3.up.add(item.scope3.up),
            dw: acc.scope3.dw.add(item.scope3.dw),
            wg: acc.scope3.wg.add(item.scope3.wg),
          }

          acc.production = acc.production.add(item.production)

          return acc
        },
        {
          entry: '',
          scope1: { sc: new Decimal(0), mc: new Decimal(0), fe: new Decimal(0), pe: new Decimal(0) },
          scope2: { heat: new Decimal(0), cooling: new Decimal(0), steam: new Decimal(0), electric: new Decimal(0) },
          scope3: {
            ec: new Decimal(0),
            bt: new Decimal(0),
            up: new Decimal(0),
            dw: new Decimal(0),
            wg: new Decimal(0),
          },
          production: new Decimal(0),
        },
      )
    })
  }

  async emissionsSummary({ db, groupByIds, ranges, config }: {
    db: string,
    useDebug: boolean
    groupByIds: number[]
    ranges: ReturnType<typeof generateDateRangesAnnually>,
    config: Omit<Configuration, 'id'>
  }) {
    const _accumulatorFor = calcSummaryActivities(ranges)
    const _accumulatorFLatList = calcSummaryActivitiesFlatList(ranges)

    const query = collect({ db, groupByIds, dateRange: [ranges.at(0)!.from, ranges.at(-1)!.to] })

    const OptOutCalc = async (key: keyof Configuration['optOutCalc'], promise: () => Promise<unknown>) => config.optOutCalc?.[key] ? Promise.resolve() : promise()

    await Promise.all([
      query<TActivity, EmissionProductionRepository>(this.emissionProductionGetter).then(result => _accumulatorFor('production', result.map(pluckActivities))),

      //  SCOPE 1
      query<TActivity, EmissionScope1StationaryCombustionRepository>(this.emissionScope1StationaryCombustionGetter).then(result => _accumulatorFor('scope1.sc', result.map(pluckActivities))),
      query<TActivity, EmissionScope1MobileCombustionRepository>(this.emissionScope1MobileCombustionGetter).then(result => _accumulatorFor('scope1.mc', result.map(pluckActivities))),
      query<TActivity, EmissionScope1ProcessEmissionRepository>(this.emissionScope1ProcessEmissionGetter).then(result => _accumulatorFor('scope1.pe', result.map(pluckActivities))),
      query<TActivity, EmissionScope1FugitiveEmissionRepository>(this.emissionScope1FugitiveEmissionGetter).then(result => _accumulatorFor('scope1.fe', result.map(pluckActivities))),

      // SCOPE 2
      query<TActivity & {
        type: 'heat' | 'cooling' | 'steam' | 'electric'
      }, EmissionScope2Repository>(this.emissionScope2Getter).then(result => {
        const grouped = _groupBy(result, 'type')
        _accumulatorFor('scope2.heat', map(_get(grouped, 'heat', []), 'activities'))
        _accumulatorFor('scope2.cooling', map(_get(grouped, 'cooling', []), 'activities'))
        _accumulatorFor('scope2.steam', map(_get(grouped, 'steam', []), 'activities'))
        _accumulatorFor('scope2.electric', map(_get(grouped, 'electric', []), 'activities'))
      }),

      //  SCOPE 3
      OptOutCalc('employee-commuting', () => query<TActivity, EmissionScope3EmployeeCommutingRepository>(this.emissionScope3EmployeeCommutingGetter).then(result => _accumulatorFor('scope3.ec', result.map(pluckActivities)))),
      OptOutCalc('waste-generated', () => query<TActivity, EmissionScope3WasteGeneratedRepository>(this.emissionScope3WasteGeneratedGetter).then(result => _accumulatorFor('scope3.wg', result.map(pluckActivities)))),
      query<{
        date: Date,
        co2e: Decimal
      }, EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository>(this.emissionScope3UdtdGetter).then(result => {
        const { upstream = [], downstream = [] } = _groupBy(result, 'type')
        if (!config.optOutCalc?.['upstream']) {
          _accumulatorFLatList('scope3.up', upstream)
        }

        if (!config.optOutCalc?.['downstream']) {
          _accumulatorFLatList('scope3.dw', downstream)
        }
      }),
      OptOutCalc('business-travel', () => query<{
        id: number,
        date: Date,
        co2e: Decimal
      }, EmissionScope3BusinessTravelRepository>(this.emissionScope3BusinessTravelGetter).then(result => _accumulatorFLatList('scope3.bt', result))),
    ])

    return ranges.map(({ from, to, ...rest }) => ({ ...rest }))
  }

  async emissionsByWidget({
                            db,
                            from,
                            to,
                            groupByIds,
                            config,
                          }: {
    db: string,
    from: Date
    to: Date
    useDebug: boolean
    groupByIds: number[]
    type?: 'emissionByScope' | 'emissionIntensity'
    view?: 'annually' | 'quarterly' | 'monthly'
    isFY: boolean
    financialYearStartMonth?: undefined | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    config: Omit<Configuration, 'id'>
  }) {
    const dateRange = transformDateRange([from, to])!

    const whereQuery = `
      WHERE groupBy.id IN (${groupByIds.join(',')})
      AND (Activity.date >= '${dateRange[0]}' OR Activity.date IS NULL)
      AND (Activity.date <= '${dateRange[1]}' OR Activity.date IS NULL)
    `

    const wasteQuery = config.optOutCalc?.['waste-generated']
      ? `SELECT 'waste' AS type, 0 AS total`
      : `
                SELECT 'waste' AS type, COALESCE(SUM(Activity.input), 0) AS total
                FROM ${db}.EmissionScope3WasteGeneratedActivity AS Activity
                         LEFT JOIN ${db}.EmissionScope3WasteGenerated AS wg ON Activity.wasteGeneratedId = wg.id
                         LEFT JOIN ${db}.GroupBy AS groupBy ON groupBy.id = wg.groupById
                    ${whereQuery}
      `

    const combinedQuery = `
        SELECT 'LPG' AS type, COALESCE(SUM(Activity.input), 0) AS total
        FROM ${db}.EmissionScope1StationaryCombustionActivity AS Activity
                 LEFT JOIN ${db}.EmissionScope1StationaryCombustion AS st ON Activity.stationaryCombustionId = st.id
                 LEFT JOIN ${db}.GroupBy AS groupBy ON groupBy.id = st.groupById ${whereQuery}
            AND st.typeId = 'liquid-liquefied-petroleum-gases-lpg'

        UNION ALL

        SELECT 'natural-gas' AS type, COALESCE(SUM(Activity.input), 0) AS total
        FROM ${db}.EmissionScope1StationaryCombustionActivity AS Activity
                 LEFT JOIN ${db}.EmissionScope1StationaryCombustion AS st ON Activity.stationaryCombustionId = st.id
                 LEFT JOIN ${db}.GroupBy AS groupBy ON groupBy.id = st.groupById ${whereQuery}
            AND st.typeId = 'gas-natural-gas'

        UNION ALL

        ${wasteQuery}

        UNION ALL

        SELECT 'electric' AS type, COALESCE(SUM(Activity.input), 0) AS total
        FROM ${db}.EmissionScope2Activity AS Activity
                 LEFT JOIN ${db}.EmissionScope2 AS scope2 ON Activity.scope2Id = scope2.id
                 LEFT JOIN ${db}.GroupBy AS groupBy ON groupBy.id = scope2.groupById
            ${whereQuery}

        UNION ALL

        SELECT 'production' AS type, COALESCE(SUM(Activity.input), 0) AS total
        FROM ${db}.EmissionProductionActivity AS Activity
                 LEFT JOIN ${db}.EmissionProduction AS production ON Activity.emissionProductionId = production.id
                 LEFT JOIN ${db}.GroupBy AS groupBy ON groupBy.id = production.groupById
            ${whereQuery}
    `

    const result = await this.execute(combinedQuery) as { type: string, total: number }[]

    return result.reduce((acc: Record<string, Decimal>, c) => {
      acc[c.type] = new Decimal(c.total).toDecimalPlaces(2)
      return acc
    }, {} as Record<string, Decimal>)
  }
}

const pluckActivities = <T extends TActivity>(i: T) => i.activities

const collect = (payload: any) => async <
  RowResult,
  T extends DefaultCrudRepository<any, any, any>,
>(repoGetter: Getter<T>) => {
  type RepoReturn = { optimize: (_: any) => Promise<{ rows: RowResult[] }> }

  const repo = await repoGetter() as unknown as RepoReturn
  const { rows: result } = await repo.optimize(payload)

  return result
}