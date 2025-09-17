import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  GroupBy,
  EmissionScope3EmployeeCommuting,
  EmissionScope3EmployeeCommutingActivity,
  EmissionScope3EmployeeCommutingRelations,
  EmissionScope3EmployeeCommutingWithRelations,
  EmployeeRegistry,
} from '../models'
import {
  GroupByRepository,
  EmployeeRegistryRepository,
  EmissionScope3EmployeeCommutingActivityRepository,
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionFactorRepository,
  findMobileCombustion,

} from '../repositories'
import { endOfMonth, format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { curry, flow, get as _get, setWith } from 'lodash'
import { queryDataInMonthOf } from '../common/model-filter-helpers'
import { EnvConfig } from '../configurations/secrets'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'
import { DatabaseConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common/'
import { kgToTon } from '../common/helpers'

export class EmissionScope3EmployeeCommutingRepository extends TimeStampRepositoryMixin<
  EmissionScope3EmployeeCommuting,
  typeof EmissionScope3EmployeeCommuting.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope3EmployeeCommuting,
      typeof EmissionScope3EmployeeCommuting.prototype.id,
      EmissionScope3EmployeeCommutingRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly employeeRegistry: BelongsToAccessor<EmployeeRegistry, typeof EmissionScope3EmployeeCommuting.prototype.id>

  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope3EmployeeCommuting.prototype.id>
  public readonly activities: HasManyRepositoryFactory<
    EmissionScope3EmployeeCommutingActivity,
    typeof EmissionScope3EmployeeCommuting.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('EmployeeRegistryRepository')
    protected employeeRegistryGetter: Getter<EmployeeRegistryRepository>,
    @repository.getter('EmissionScope3EmployeeCommutingActivityRepository')
    protected emissionScope3EmployeeCommutingActivityGetter: Getter<EmissionScope3EmployeeCommutingActivityRepository>,
    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(EmissionScope3EmployeeCommuting, dataSource, userRepositoryGetter)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', emissionScope3EmployeeCommutingActivityGetter)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)

    this.employeeRegistry = this.createBelongsToAccessorFor('employeeRegistry', employeeRegistryGetter)
    this.registerInclusionResolver('employeeRegistry', this.employeeRegistry.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionScope3EmployeeCommuting>) {
    if (entity.employeeRegistryId && entity.groupById) {
      const isAlreadyExist = await this.findOne({
        where: { and: [{ employeeRegistryId: entity.employeeRegistryId }, { groupById: entity.groupById }] },
      })

      if (isAlreadyExist) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of type & group')
      }
    }
  }

  async create(entity: DataObject<EmissionScope3EmployeeCommuting>, options?: Options): Promise<EmissionScope3EmployeeCommuting> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(
    id: typeof EmissionScope3EmployeeCommuting.prototype.id,
    data: DataObject<EmissionScope3EmployeeCommuting>,
    options?: Options,
  ): Promise<void> {
    await this.isDuplicate(data)
    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope3EmployeeCommuting.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionScope3EmployeeCommutingActivityGetter()
    await activities.deleteAll({ employeeCommutingId: id })

    return super.deleteById(id, options)
  }

  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)
    const EF_MC = await this.emissionFactorRepository.analysisEmissionFactor({ mobile_combustion: true, EF: merged.EF })

    const whereClause = `
      es3ec.id IS NOT NULL
      AND employeeRegistry.id IS NOT NULL
      ${merged.groupByIds ? `AND groupBy.id IN (${merged.groupByIds})` : ''}
      ${merged.q ? `AND (employeeRegistry.name LIKE '%${merged.q}%' or  employeeRegistry.staffId LIKE '%${merged.q}%')` : ''}
    `
    const dateWhereClause = `(Activity.date IS NULL OR (Activity.date >= '${merged.dateRange?.[0]}' AND Activity.date <= '${merged.dateRange?.[1]}'))`

    const paginate = merged.page ? `
        ORDER BY ${merged.sorting ?? 'employeeRegistry.name ASC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0}
    ` : ''

    const mainQuery = `
        SELECT es3ec.id,
               es3ec.groupById,
               es3ec.status,
               es3ec.employeeRegistryId,
               JSON_ARRAYAGG(
                       JSON_OBJECT(
                               'id', Activity.id,
                               'input', Activity.input,
                               'employeeCommutingId', Activity.employeeCommutingId,
                               'date', Activity.date,
                               'desc', Activity.desc,
                               'metadata', Activity.metadata
                       )
               )                                                   AS activities,
               JSON_OBJECT(
                       'id', employeeRegistry.id,
                       'name', employeeRegistry.name,
                       'status', employeeRegistry.status,
                       'staffId', employeeRegistry.staffId
               )                                                   AS employeeRegistry,
               JSON_OBJECT('id', groupBy.id, 'name', groupBy.name) AS groupBy
        FROM ${merged.db}.EmissionScope3EmployeeCommuting AS es3ec
                 LEFT JOIN
             ${merged.db}.EmissionScope3EmployeeCommutingActivity AS Activity
             ON es3ec.id = Activity.employeeCommutingId
                 AND ${dateWhereClause}
                 LEFT JOIN
             ${merged.db}.EmployeeRegistry as employeeRegistry
             ON es3ec.employeeRegistryId = employeeRegistry.id
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON es3ec.groupById = groupBy.id
        WHERE ${whereClause}
        GROUP BY es3ec.id, employeeRegistry.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT es3ec.id
              FROM ${merged.db}.EmissionScope3EmployeeCommuting AS es3ec
                       LEFT JOIN
                   ${merged.db}.EmissionScope3EmployeeCommutingActivity AS Activity
                   ON es3ec.id = Activity.employeeCommutingId
                       AND ${dateWhereClause}
                       LEFT JOIN
                   ${merged.db}.EmployeeRegistry as employeeRegistry
                   ON es3ec.employeeRegistryId = employeeRegistry.id
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON es3ec.groupById = groupBy.id
              WHERE ${whereClause}
              GROUP BY es3ec.id) AS CountedRows;
    `

    const calc = calculate_EC_co2e(EF_MC, { useDebug: merged.useDebug, omitEmployeeRegistryInfo: false })
    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) => {
        return rows
          .map((row: any) => {
            const activities = JSON.parse(row.activities || '[]').map((_: any) => ({
              ..._,
              metadata: JSON.parse(_.metadata || null),
            }))


            return {
              ...row,
              activities,
              employeeRegistry: JSON.parse(row.employeeRegistry || '{}'),
              groupBy: JSON.parse(row.groupBy || '{}'),
            }
          })
          .map(calc)
      }) as Promise<
        {
          employeeRegistry: { id: number; name: string; staffId: number; status: 'active' | 'inactive' }
          employeeRegistryId: EmissionScope3EmployeeCommuting['employeeRegistryId']
          id: EmissionScope3EmployeeCommuting['id']
          status: EmissionScope3EmployeeCommuting['status']
          activities: TActivity;
          groupBy: { name: string; id: number }
          groupById: EmissionScope3EmployeeCommuting['groupById']
        }[]
      >,
      this.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>,
    ])

    return { rows, rowCount }
  }

  /**
   * Get all current company's slug. Then for each database,
   * get current year and month,
   * check in EmployeeRegistryCommutingActivityRepo
   *  if there is already data exist (meaning its already cron job already push the data), and then stop
   *  if data not exist, then grab all EmployeeRegistryCommutingRepo status=active,
   * and then push to EmployeeRegistryCommutingActivityRepo
   **/
  async pushEmployeeCommutingActivities(tenantId: string, { groupByIds, date }: { date: Date, groupByIds: number[] }) {
    const activityRepo = await this.emissionScope3EmployeeCommutingActivityGetter()

    // const [month, year] = [3, 2014]
    const [month, year] = [date.getMonth(), date.getFullYear()]

    const employeeCommutingData = (await this.find({
      where: {
        status: 'active',
        ...(groupByIds.length > 0 ? { groupById: { inq: groupByIds } } : {}),
      },
      fields: ['employeeRegistryId', 'id'],
      include: [
        {
          relation: 'employeeRegistry',
          scope: { fields: ['id', 'addressFrom', 'addressTo', 'distance', 'EF_MobileCombustionDistanceId', 'avg_day_working_per_month'] },
        },
        {
          relation: 'activities',
          scope: { where: { and: queryDataInMonthOf(year, month + 1) } },
        },
      ],
    })) as EmissionScope3EmployeeCommutingWithRelations[]

    const ecTobeInsert = employeeCommutingData.map(ec => {
      return ((ec.activities ?? []).length === 0) ? {
        date: endOfMonth(date),
        input: ec.employeeRegistry?.avg_day_working_per_month ?? 0,
        desc: groupByIds.length > 0
          ? `Manual push all at (${format(date, 'yyyy-MM-dd')})`
          : `Data generated from schedule system (${format(date, 'yyyy-MM-dd')})`,
        metadata: {
          addressFrom: ec.employeeRegistry?.addressFrom ?? '',
          addressTo: ec.employeeRegistry?.addressTo ?? '',
          distance: ec.employeeRegistry?.distance ?? 0,
          EF_MobileCombustionDistanceId: ec.employeeRegistry?.EF_MobileCombustionDistanceId ?? '',
        },
        employeeCommutingId: ec.id,
      } : null
    }).filter(i => !!i)

    if (ecTobeInsert.length > 0) {
      await activityRepo.createAll(ecTobeInsert)
    }

    return ecTobeInsert.length
  }
}

export const calculate_EC_co2e = curry(
  (
    {
      selectProperYear,
      mapYearsToEmissionFactors,
    }: Awaited<ReturnType<EmissionFactorRepository['analysisEmissionFactor']>>,
    config: { useDebug?: boolean; omitEmployeeRegistryInfo: boolean },
    ec_emission: EmissionScope3EmployeeCommutingWithRelations,
  ) => {
    const employeeRegistry = _get(ec_emission, 'employeeRegistry', config.omitEmployeeRegistryInfo ? {} : undefined)

    return !employeeRegistry
      ? null
      : {
        id: ec_emission.id,
        status: ec_emission.status,
        employeeRegistry,
        employeeRegistryId: ec_emission.employeeRegistryId,
        groupBy: ec_emission.groupBy,
        groupById: ec_emission.groupById,
        activities: flow(
          (activities) =>
            activities.reduce(
              (acc: TActivity, current: EmissionScope3EmployeeCommutingActivity) => {
                if (!current.metadata) return acc

                const [year, month] = format(new Date(current.date), 'yyyy-M-dd').split('-')
                const yearToSelect = selectProperYear(year)
                const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

                const avg_day_working_per_month = current.input
                const { distance, EF_MobileCombustionDistanceId } = current.metadata

                const foundEmission = findMobileCombustion(emissionFactorSelected.mobile_combustion, EF_MobileCombustionDistanceId)

                const baseInput = new Decimal(avg_day_working_per_month).times(distance)

                const CO2 = baseInput.times(foundEmission.CO2).times(emissionFactorSelected.GWP.CO2)
                const CH4 = baseInput.times(foundEmission.CH4).times(emissionFactorSelected.GWP.CH4)
                const N2O = baseInput.times(foundEmission.N2O).times(emissionFactorSelected.GWP.N2O)
                const co2e = CO2.plus(CH4).plus(N2O).toDecimalPlaces(2)

                if (config.useDebug || EnvConfig.isDev) {
                  setWith(acc, `${year}.emission`, { emissionFactorYear: yearToSelect, ...foundEmission })

                  const prev = _get(acc, `${year}.detail.${month}`, []) as any[]
                  const _debugs = debugs({
                    avg_day_working_per_month,
                    distance,
                    foundEmission,
                    GWP: mapYearsToEmissionFactors[yearToSelect].GWP,
                  })

                  prev.push({ CO2: _debugs('CO2'), CH4: _debugs('CH4'), N2O: _debugs('N2O'), co2e })
                  setWith(acc, `${year}.detail.${month}`, prev)
                }

                // if (year === '2024' && month === '1' && ec_emission.employeeRegistryId === 27) {
                //   console.log(current, employeeRegistry)
                // }

                const path = `${year}.${month}`
                const val = _get(acc, path, new Decimal(0)).add(co2e)
                setWith(acc, path, val, Object)

                return acc
              },
              {} as TActivity,
            ),
          kgToTon,
        )(ec_emission.activities ?? []),
      }
  },
)

const debugs =
  ({ avg_day_working_per_month, distance, foundEmission, GWP }: any) =>
    (symbol: string) =>
      `${avg_day_working_per_month} * ${distance} * ${foundEmission[symbol]} * ${GWP[symbol]} = ${avg_day_working_per_month * distance * foundEmission[symbol] * GWP[symbol]}`
