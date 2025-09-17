import { inject, Getter, Constructor } from '@loopback/core'
import {
  BelongsToAccessor,
  DefaultTransactionalRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  GroupBy,
  EmissionScope3BusinessTravel,
  EmissionScope3BusinessTravelActivity,
  EmissionScope3BusinessTravelRelations,
  EmissionScope3BusinessTravelDataWithRelations,
} from '../models'
import {
  GroupByRepository,
  EmployeeRegistryRepository,
  EmissionScope3BusinessTravelActivityRepository,
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionFactorRepository,
  findMobileCombustion,
} from '../repositories'
import { curry, get, groupBy } from 'lodash'
import { Options } from '@loopback/repository/src/common-types'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { transformQueries, BeforeTransform } from '../common/'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'

export class EmissionScope3BusinessTravelRepository extends TimeStampRepositoryMixin<
  EmissionScope3BusinessTravel,
  typeof EmissionScope3BusinessTravel.prototype.id,
  Constructor<
    DefaultTransactionalRepository<
      EmissionScope3BusinessTravel,
      typeof EmissionScope3BusinessTravel.prototype.id,
      EmissionScope3BusinessTravelRelations
    >
  >
>(DefaultTransactionalRepository) {
  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope3BusinessTravel.prototype.id>

  public readonly travelers: HasManyRepositoryFactory<
    EmissionScope3BusinessTravelActivity,
    typeof EmissionScope3BusinessTravel.prototype.id
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
    @repository.getter('EmissionScope3BusinessTravelActivityRepository')
    protected emissionScope3BusinessTravelActivityGetter: Getter<EmissionScope3BusinessTravelActivityRepository>,
    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(EmissionScope3BusinessTravel, dataSource, userRepositoryGetter)

    this.travelers = this.createHasManyRepositoryFactoryFor('travelers', emissionScope3BusinessTravelActivityGetter)
    this.registerInclusionResolver('travelers', this.travelers.inclusionResolver)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope3BusinessTravel.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionScope3BusinessTravelActivityGetter()
    await activities.deleteAll({ businessTravelId: id })

    return super.deleteById(id, options)
  }

  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)

    const EF_MC = await this.emissionFactorRepository.analysisEmissionFactor({ mobile_combustion: true, EF: merged.EF })

    const whereClause = `
      bt.id IS NOT NULL
      ${merged.groupByIds ? `AND groupBy.id IN (${merged.groupByIds})` : ''}
      ${merged.q ? `AND (bt.purpose LIKE '%${merged.q}%' OR bt.desc LIKE '%${merged.q}%')` : ''}
      ${merged.dateRange?.[0] ? `AND (bt.date >= '${merged.dateRange[0]}' OR bt.date IS NULL)` : ''}
      ${merged.dateRange?.[1] ? `AND (bt.date <= '${merged.dateRange[1]}' OR bt.date IS NULL)` : ''}
    `

    const paginate = merged.page ? `
        ORDER BY ${merged.sorting ?? 'date DESC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0}
    ` : ''

    const mainQuery = `
        SELECT bt.id,
               bt.date,
               bt.purpose,
               bt.desc,
               bt.groupById,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName,
               JSON_ARRAYAGG(
                       JSON_OBJECT(
                               'id', Traveler.id,
                               'businessTravelId', Traveler.businessTravelId,
                               'employeeRegistryId', Traveler.employeeRegistryId,
                               'logs', Traveler.logs,
                               'employeeRegistry', JSON_OBJECT(
                                       'id', EmployeeRegistry.id,
                                       'name', EmployeeRegistry.name
                                                   )
                       )
               )            AS travelers
        FROM ${merged.db}.EmissionScope3BusinessTravel AS bt
                 LEFT JOIN
             ${merged.db}.EmissionScope3BusinessTravelActivity AS Traveler
             ON Traveler.businessTravelId = bt.id
                 LEFT JOIN
             ${merged.db}.EmployeeRegistry
             ON Traveler.employeeRegistryId = EmployeeRegistry.id
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON bt.groupById = groupBy.id
        WHERE ${whereClause}
        GROUP BY bt.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT bt.id
              FROM ${merged.db}.EmissionScope3BusinessTravel AS bt
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON bt.groupById = groupBy.id
              WHERE ${whereClause}
              GROUP BY bt.id, groupBy.id) AS CountedRows;
    `

    const [rows, rowCountResult] = await Promise.all([
      this.execute(mainQuery) as Promise<any[]>,
      this.execute(countQuery) as Promise<[{ totalCount: number }]>,
    ]) // prettier-ignore

    const calc = calculate_BT_co2e(EF_MC, { useDebug: merged.useDebug, omitEmployeeRegistryInfo: false })

    return {
      rows: rows
        .map((i) => {
          const travelers = JSON.parse(i.travelers) ?? []

          // @ts-ignore
          return { ...i, travelers: travelers.map((i) => ({ ...i, logs: JSON.parse(i.logs) ?? [] })) }
        })
        .map(calc),
      rowCount: rowCountResult[0]?.totalCount || 0,
    }
  }

  // optimizePost
  async optimizePost({ travelers, ...payload }: EmissionScope3BusinessTravel) {
    const btActivities = await this.emissionScope3BusinessTravelActivityGetter()

    const transaction = await this.beginTransaction()
    let btData = payload

    try {
      if (payload.id) {
        await this.updateById(payload.id, payload, { transaction })
      } else {
        btData = await this.create(payload, { transaction })
      }

      const {
        createAll = [],
        updateById = [],
      } = groupBy(travelers, (traveler) => (traveler.id ? 'updateById' : 'createAll')) || {}

      if (createAll.length) {
        await btActivities.createAll(
          createAll.map((activity) => ({ ...activity, businessTravelId: btData.id })),
          { transaction },
        )
      }

      if (updateById.length) {
        await Promise.all(updateById.map((activity) => btActivities.updateById(activity.id, activity, { transaction })))
      }

      await transaction.commit()
    } catch (e) {
      await transaction.rollback()
      throw e // Re-throw the error to handle it in the calling context
    }
  }
}

export const calculate_BT_co2e = curry(
  (
    {
      selectProperYear,
      mapYearsToEmissionFactors,
    }: Awaited<ReturnType<EmissionFactorRepository['analysisEmissionFactor']>>,
    config: { useDebug?: boolean; omitEmployeeRegistryInfo: boolean },
    bt_emission: EmissionScope3BusinessTravel,
  ) => {
    const [year, month] = format(new Date(bt_emission.date), 'yyyy-M-dd').split('-')
    const yearToSelect = selectProperYear(year)
    const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

    const travelers = bt_emission.travelers as unknown as EmissionScope3BusinessTravelDataWithRelations[]

    const optimizeBT = (travelers ?? []).reduce<{ co2e: Decimal; travelers: string[]; emissionPerTraveler: any[] }>(
      (acc, traveler) => {
        const employeeName = get(traveler, 'employeeRegistry.name', config.omitEmployeeRegistryInfo ? {} : 'na')
        const emissionPerTraveler = { employeeName, logs: [] } as any

        const totalCo2e = traveler.logs.reduce((accLogs, log) => {
          const foundEmission = findMobileCombustion(emissionFactorSelected.mobile_combustion, log.EF_MobileCombustionDistanceId)

          // if litre not-found, the force to be distance
          const currentType = {
            distance: { CO2: foundEmission.CO2, CH4: foundEmission.CH4, N2O: foundEmission.N2O },
            litre: { CO2: foundEmission.litre!?.CO2, CH4: foundEmission.litre!?.CH4, N2O: foundEmission.litre!?.N2O }, // prettier-ignore
          }[foundEmission.litre ? log.type : 'distance']

          const CO2 = new Decimal(log.input).times(currentType.CO2).times(emissionFactorSelected.GWP.CO2)
          const CH4 = new Decimal(log.input).times(currentType.CH4).times(emissionFactorSelected.GWP.CH4)
          const N2O = new Decimal(log.input).times(currentType.N2O).times(emissionFactorSelected.GWP.N2O)
          const co2e = CO2.plus(CH4).plus(N2O)

          if (config.useDebug || EnvConfig.isDev) {
            emissionPerTraveler.logs.push({
              foundEmission,
              EF_MobileCombustionDistanceId: log.EF_MobileCombustionDistanceId,
              type: foundEmission.litre ? log.type : 'distance',
              input: log.input,
              calc: {
                CO2: `${log.input} * ${currentType.CO2} * ${emissionFactorSelected.GWP.CO2}`,
                CH4: `${log.input} * ${currentType.CH4} * ${emissionFactorSelected.GWP.CH4}`,
                N2O: `${log.input} * ${currentType.N2O} * ${emissionFactorSelected.GWP.N2O}`,
                co2e,
              },
            })
          }

          return accLogs.plus(co2e)
        }, new Decimal(0))

        acc.co2e = acc.co2e.plus(totalCo2e)
        acc.travelers.push(employeeName as string)
        acc.emissionPerTraveler.push(emissionPerTraveler)

        return acc
      },
      { co2e: new Decimal(0), travelers: [], emissionPerTraveler: [] },
    )

    return {
      ...bt_emission,
      travelers: optimizeBT.travelers,
      co2e: optimizeBT.co2e.dividedBy(1000).toDecimalPlaces(2).toNumber(),
      ...(config.useDebug || EnvConfig.isDev
        ? {
          emission: {
            emissionFactorYear: yearToSelect,
            emissionPerTraveler: optimizeBT.emissionPerTraveler,
            GWP: emissionFactorSelected.GWP,
          },
        }
        : {}),
    }
  },
)
