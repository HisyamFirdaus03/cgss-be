import { Constructor, Getter, inject } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope3UpstreamDownstreamTransportationAndDistribution,
  EmissionScope3UpstreamDownstreamTransportationAndDistributionWithRelations,
  EmployeeRegistry,
  GroupBy,
} from '../models'
import {
  EmissionFactorRepository,
  findMobileCombustion,
  GroupByRepository,
  TimeStampRepositoryMixin,
  UserRepository,
} from '../repositories'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { curry, set, setWith } from 'lodash'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common/'

const CurrentModel = EmissionScope3UpstreamDownstreamTransportationAndDistribution

export class EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository extends TimeStampRepositoryMixin<
  EmissionScope3UpstreamDownstreamTransportationAndDistribution,
  typeof CurrentModel.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope3UpstreamDownstreamTransportationAndDistribution,
      typeof CurrentModel.prototype.id,
      EmissionScope3UpstreamDownstreamTransportationAndDistributionWithRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly employeeRegistry: BelongsToAccessor<EmployeeRegistry, typeof CurrentModel.prototype.id>

  public readonly groupBy: BelongsToAccessor<GroupBy, typeof CurrentModel.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(CurrentModel, dataSource, userRepositoryGetter)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)
  }

  async optimize(params: BeforeTransform<{ type?: 'upstream' | 'downstream' }>) {
    const merged = transformQueries(params)

    const EF_MC = await this.emissionFactorRepository.analysisEmissionFactor({ mobile_combustion: true, EF: merged.EF })

    const whereClause = `
      udtd.id IS NOT NULL
      ${merged.type ? `AND udtd.type = '${merged.type}'` : ''}
      ${merged.groupByIds ? `AND groupBy.id IN (${merged.groupByIds})` : ''}
      ${merged.q ? `AND (udtd.name LIKE '%${merged.q}%' OR udtd.desc LIKE '%${merged.q}%')` : ''}
      ${merged.dateRange?.[0] ? `AND (udtd.date >= '${merged.dateRange[0]}' OR udtd.date IS NULL)` : ''}
      ${merged.dateRange?.[1] ? `AND (udtd.date <= '${merged.dateRange[1]}' OR udtd.date IS NULL)` : ''}
    `

    const paginate = merged.page ? `
        ORDER BY ${merged.sorting ?? 'date DESC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0}
    ` : ''

    const mainQuery = `
        SELECT udtd.id,
               udtd.date,
               udtd.name,
               udtd.desc,
               udtd.groupById,
               udtd.type,
               udtd.metadata,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName
        FROM ${merged.db}.EmissionScope3UpstreamDownstreamTransportationAndDistribution AS udtd
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON udtd.groupById = groupBy.id
        WHERE ${whereClause} ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM ${merged.db}.EmissionScope3UpstreamDownstreamTransportationAndDistribution AS udtd
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON udtd.groupById = groupBy.id
        WHERE ${whereClause};
    `

    const calc = calculate_UDTD(EF_MC, { useDebug: merged.useDebug })

    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) => rows.map((i: any) => ({
        ...i,
        metadata: JSON.parse(i.metadata),
      })).map(calc)) as Promise<
        {
          id: EmissionScope3UpstreamDownstreamTransportationAndDistribution['id']
          date: EmissionScope3UpstreamDownstreamTransportationAndDistribution['date']
          name: EmissionScope3UpstreamDownstreamTransportationAndDistribution['name']
          desc: EmissionScope3UpstreamDownstreamTransportationAndDistribution['desc']
          groupById: EmissionScope3UpstreamDownstreamTransportationAndDistribution['groupById']
          groupByName: string
          type: EmissionScope3UpstreamDownstreamTransportationAndDistribution['type']
          metadata: EmissionScope3UpstreamDownstreamTransportationAndDistribution['metadata']
          activities: TActivity
          co2e: Decimal
        }[]
      >,
      this.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>,
    ])

    return { rows, rowCount }
  }
}

export const calculate_UDTD = curry(
  (
    {
      selectProperYear,
      mapYearsToEmissionFactors,
    }: Awaited<ReturnType<EmissionFactorRepository['analysisEmissionFactor']>>,
    config: { useDebug?: boolean },
    ec_emission: EmissionScope3UpstreamDownstreamTransportationAndDistribution,
  ) => {
    const { date } = ec_emission
    const [year, month] = format(new Date(date), 'yyyy-M-dd').split('-')
    const yearToSelect = selectProperYear(year)
    const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

    const { distance, EF_MobileCombustionDistanceId } = ec_emission.metadata
    const foundEmission = findMobileCombustion(emissionFactorSelected.mobile_combustion, EF_MobileCombustionDistanceId)
    set(ec_emission, 'metadata.displayAs', foundEmission.vehicle_type)

    const baseInput = new Decimal(distance)

    const CO2 = baseInput.times(foundEmission.CO2).times(emissionFactorSelected.GWP.CO2)
    const CH4 = baseInput.times(foundEmission.CH4).times(emissionFactorSelected.GWP.CH4)
    const N2O = baseInput.times(foundEmission.N2O).times(emissionFactorSelected.GWP.N2O)
    const co2e = CO2.plus(CH4).plus(N2O).dividedBy(1000).toDecimalPlaces(2).toNumber()

    if (config.useDebug || EnvConfig.isDev) {
      setWith(ec_emission, 'emission', { emissionFactorYear: yearToSelect, ...foundEmission })

      const _debugs = debugs({ distance, foundEmission, GWP: mapYearsToEmissionFactors[yearToSelect].GWP })

      setWith(ec_emission, 'detail', { CO2: _debugs('CO2'), CH4: _debugs('CH4'), N2O: _debugs('N2O'), co2e })
    }

    return { ...ec_emission, co2e }
  },
)

const debugs =
  ({ distance, foundEmission, GWP }: any) =>
    (symbol: string) =>
      `${distance} * ${foundEmission[symbol]} * ${GWP[symbol]} = ${distance * foundEmission[symbol] * GWP[symbol]}`
