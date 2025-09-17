import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  GroupBy,
  EmissionScope1MobileCombustion,
  EmissionScope1MobileCombustionActivity,
  EmissionScope1MobileCombustionRelations,
  MobileRegistry,
  EmissionScope1MobileCombustionWithRelations,
} from '../models'
import {
  GroupByRepository,
  MobileRegistryRepository,
  EmissionScope1MobileCombustionActivityRepository,
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionFactorRepository,
  findMobileCombustion,

} from '../repositories'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { curry, flow, get as _get, setWith } from 'lodash'
import { EnvConfig } from '../configurations/secrets'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'
import { DatabaseConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common/'
import { kgToTon } from '../common/helpers'

export class EmissionScope1MobileCombustionRepository extends TimeStampRepositoryMixin<
  EmissionScope1MobileCombustion,
  typeof EmissionScope1MobileCombustion.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1MobileCombustion,
      typeof EmissionScope1MobileCombustion.prototype.id,
      EmissionScope1MobileCombustionRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly mobileRegistry: BelongsToAccessor<MobileRegistry, typeof EmissionScope1MobileCombustion.prototype.id>

  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope1MobileCombustion.prototype.id>
  public readonly activities: HasManyRepositoryFactory<
    EmissionScope1MobileCombustionActivity,
    typeof EmissionScope1MobileCombustion.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('MobileRegistryRepository')
    protected mobileRegistryGetter: Getter<MobileRegistryRepository>,
    @repository.getter('EmissionScope1MobileCombustionActivityRepository')
    protected emissionScope1MobileCombustionActivityGetter: Getter<EmissionScope1MobileCombustionActivityRepository>,
    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(EmissionScope1MobileCombustion, dataSource, userRepositoryGetter)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', emissionScope1MobileCombustionActivityGetter)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)

    this.mobileRegistry = this.createBelongsToAccessorFor('mobileRegistry', mobileRegistryGetter)
    this.registerInclusionResolver('mobileRegistry', this.mobileRegistry.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionScope1MobileCombustion>) {
    if (entity.mobileRegistryId && entity.groupById) {
      const isAlreadyExist = await this.findOne({
        where: { and: [{ mobileRegistryId: entity.mobileRegistryId }, { groupById: entity.groupById }] },
      })

      if (isAlreadyExist) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of type & group')
      }
    }
  }

  async create(entity: DataObject<EmissionScope1MobileCombustion>, options?: Options): Promise<EmissionScope1MobileCombustion> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(
    id: typeof EmissionScope1MobileCombustion.prototype.id,
    data: DataObject<EmissionScope1MobileCombustion>,
    options?: Options,
  ): Promise<void> {
    await this.isDuplicate(data)
    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope1MobileCombustion.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionScope1MobileCombustionActivityGetter()
    await activities.deleteAll({ mobileCombustionId: id })

    return super.deleteById(id, options)
  }

  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)
    const EF_MC = await this.emissionFactorRepository.analysisEmissionFactor({ mobile_combustion: true, EF: merged.EF })
    const calc = calculate_MC_co2e(EF_MC, { useDebug: merged.useDebug })

    const whereClause = `
        mc_emission.id IS NOT NULL
        ${merged.q ? `AND (mobileRegistry.identity_no LIKE '%${merged.q}%' OR mobileRegistry.model LIKE '%${merged.q}%')` : ''}
        ${merged.groupByIds ? `AND groupBy.id IN (${merged.groupByIds})` : ''}
     `

    const dateWhereClause = `(Activity.date IS NULL OR (Activity.date >= '${merged.dateRange?.[0]}' AND Activity.date <= '${merged.dateRange?.[1]}'))`

    const paginate = merged.page ? `
        ORDER BY ${merged.sorting ?? 'mobileRegistry.identity_no ASC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0}
    ` : ''

    const mainQuery = `
        SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                               'input', Activity.input,
                               'date', Activity.date,
                               'type', Activity.type
                       )
               )            AS activities,
               mc_emission.id,
               mc_emission.status,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName,
               mc_emission.mobileRegistryId,
               JSON_OBJECT(
                       'id', mobileRegistry.id,
                       'identity_no', mobileRegistry.identity_no,
                       'EF_MobileCombustionDistanceId', mobileRegistry.EF_MobileCombustionDistanceId,
                       'model', mobileRegistry.model,
                       'status', mobileRegistry.status
               )            AS mobileRegistry
        FROM ${merged.db}.EmissionScope1MobileCombustion AS mc_emission
                 LEFT JOIN
             ${merged.db}.EmissionScope1MobileCombustionActivity AS Activity
             ON Activity.mobileCombustionId = mc_emission.id
                 AND ${dateWhereClause}
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON groupBy.id = mc_emission.groupById
                 LEFT JOIN
             ${merged.db}.MobileRegistry as mobileRegistry
             ON mobileRegistry.id = mc_emission.mobileRegistryId
        WHERE ${whereClause}
        GROUP BY mc_emission.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT mc_emission.id
              FROM ${merged.db}.EmissionScope1MobileCombustion AS mc_emission
                       LEFT JOIN
                   ${merged.db}.EmissionScope1MobileCombustionActivity AS Activity
                   ON Activity.mobileCombustionId = mc_emission.id
                       AND ${dateWhereClause}
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON groupBy.id = mc_emission.groupById
                       LEFT JOIN
                   ${merged.db}.MobileRegistry as mobileRegistry
                   ON mobileRegistry.id = mc_emission.mobileRegistryId
              WHERE ${whereClause}
              GROUP BY mc_emission.id, groupBy.id) AS CountedRows;
    `

    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) => {
        return rows
          .map((i: any) => ({
            ...i,
            mobileRegistry: JSON.parse(i.mobileRegistry || '{}'),
            activities: JSON.parse(i.activities || '[]'),
          }))
          .map(calc)
      }) as Promise<
        {
          activities: TActivity
          mobileRegistryId: number
          mobileRegistry: {
            hasLitreId: boolean
            id: number
            identity_no: string
            EF_MobileCombustionDistanceId: string
            model: string
            status: string
          }
          id: number
          status: 'active' | 'inactive'
          groupById: number
          groupByName: string
        }[]
      >,
      this.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>,
    ])

    return { rows, rowCount }
  }
}

export const calculate_MC_co2e = curry(
  (
    {
      selectProperYear,
      mapYearsToEmissionFactors,
      maxYear,
    }: Awaited<ReturnType<EmissionFactorRepository['analysisEmissionFactor']>>,
    config: { useDebug?: boolean },
    mobileEmission: EmissionScope1MobileCombustionWithRelations,
  ) => {
    const mobileRegistry = mobileEmission.mobileRegistry

    return !mobileRegistry
      ? null
      : {
        ...mobileEmission,
        mobileRegistry: {
          ...mobileRegistry,
          hasLitreId: !!findMobileCombustion(
            mapYearsToEmissionFactors[maxYear].mobile_combustion,
            mobileRegistry.EF_MobileCombustionDistanceId,
          ).litreId,
        },
        activities: flow(
          (activities) =>
            activities.reduce(
              (acc: TActivity, current: EmissionScope1MobileCombustionActivity) => {
                if (!current.date) return acc

                const [year, month] = format(new Date(current.date), 'yyyy-M-dd').split('-')
                const yearToSelect = selectProperYear(year)
                const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

                const foundEmission = findMobileCombustion(
                  emissionFactorSelected.mobile_combustion,
                  mobileRegistry.EF_MobileCombustionDistanceId,
                )

                if (config.useDebug || EnvConfig.isDev) {
                  setWith(acc, `${year}.emission`, { emissionFactorYear: yearToSelect, ...foundEmission })
                  // no details yet like stationary-combustion calc
                }

                // if litre not-found, the force to be distance
                // @ts-ignore
                const currentType = {
                  distance: { CO2: foundEmission.CO2, CH4: foundEmission.CH4, N2O: foundEmission.N2O },
                  litre: {
                    CO2: foundEmission.litre!?.CO2,
                    CH4: foundEmission.litre!?.CH4,
                    N2O: foundEmission.litre!?.N2O,
                  }, // prettier-ignore
                }[foundEmission.litre ? current.type : 'distance']

                const co2e = new Decimal(
                  (current.input * currentType.CO2 * emissionFactorSelected.GWP.CO2) +
                  (current.input * currentType.CH4 * emissionFactorSelected.GWP.CH4) +
                  (current.input * currentType.N2O * emissionFactorSelected.GWP.N2O),
                ).toDecimalPlaces(2) // prettier-ignore

                const path = `${year}.${month}`
                const val = _get(acc, path, new Decimal(0)).add(co2e)
                setWith(acc, path, val, Object)

                return acc
              },
              {} as TActivity,
            ),
          kgToTon,
        )(mobileEmission.activities ?? []),
      }
  },
)
