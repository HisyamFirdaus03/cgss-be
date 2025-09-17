import { Constructor, Getter, inject } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope1ProcessEmission,
  EmissionScope1ProcessEmissionActivity,
  EmissionScope1ProcessEmissionRelations,
  EmissionScope1ProcessEmissionWithRelations,
  GroupBy,
} from '../models'
import {
  EmissionScope1ProcessEmissionActivityRepository,
  GroupByRepository,
  TimeStampRepositoryMixin,
  UserRepository,
} from '../repositories'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { curry, flow, get as _get, setWith } from 'lodash'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common/'
import { kgToTon } from '../common/helpers'

export class EmissionScope1ProcessEmissionRepository extends TimeStampRepositoryMixin<
  EmissionScope1ProcessEmission,
  typeof EmissionScope1ProcessEmission.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1ProcessEmission,
      typeof EmissionScope1ProcessEmission.prototype.id,
      EmissionScope1ProcessEmissionRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope1ProcessEmission.prototype.id>
  public readonly activities: HasManyRepositoryFactory<
    EmissionScope1ProcessEmissionActivity,
    typeof EmissionScope1ProcessEmission.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('EmissionScope1ProcessEmissionActivityRepository')
    protected emissionScope1ProcessEmissionActivityGetter: Getter<EmissionScope1ProcessEmissionActivityRepository>,
  ) {
    super(EmissionScope1ProcessEmission, dataSource, userRepositoryGetter)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', emissionScope1ProcessEmissionActivityGetter)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionScope1ProcessEmission>) {
    if (entity.category && entity.groupById) {
      const isAlreadyExist = await this.find({ where: { and: [{ category: entity.category }, { groupById: entity.groupById }] } })
      if (isAlreadyExist.length) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of category & group')
      }
    }
  }

  async create(entity: DataObject<EmissionScope1ProcessEmission>, options?: Options): Promise<EmissionScope1ProcessEmission> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(
    id: typeof EmissionScope1ProcessEmission.prototype.id,
    data: DataObject<EmissionScope1ProcessEmission>,
    options?: Options,
  ): Promise<void> {
    await this.isDuplicate(data)
    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope1ProcessEmission.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionScope1ProcessEmissionActivityGetter()
    await activities.deleteAll({ processEmissionId: id })

    return super.deleteById(id, options)
  }

  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)

    const whereClause = `
        pe_emission.id IS NOT NULL
        ${merged.q ? `AND pe_emission.category LIKE '%${merged.q}%'` : ''}
        ${merged.groupByIds ? `AND groupBy.id IN (${merged.groupByIds})` : ''}
    `

    const dateWhereClause = `(Activity.date IS NULL OR (Activity.date >= '${merged.dateRange?.[0]}' AND Activity.date <= '${merged.dateRange?.[1]}'))`

    const paginate = merged.page ? `
        ORDER BY ${merged.sorting ?? 'category ASC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0}
    ` : ''

    const mainQuery = `
        SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                               'input', Activity.input,
                               'date', Activity.date
                       )
               )            AS activities,
               pe_emission.category,
               pe_emission.id,
               pe_emission.status,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName
        FROM ${merged.db}.EmissionScope1ProcessEmission AS pe_emission
                 LEFT JOIN
             ${merged.db}.EmissionScope1ProcessEmissionActivity AS Activity
             ON Activity.processEmissionId = pe_emission.id
                 AND ${dateWhereClause}
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON groupBy.id = pe_emission.groupById
        WHERE ${whereClause}
        GROUP BY pe_emission.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT pe_emission.id
              FROM ${merged.db}.EmissionScope1ProcessEmission AS pe_emission
                       LEFT JOIN
                   ${merged.db}.EmissionScope1ProcessEmissionActivity AS Activity
                   ON Activity.processEmissionId = pe_emission.id
                       AND ${dateWhereClause}
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON groupBy.id = pe_emission.groupById
              WHERE ${whereClause}
              GROUP BY pe_emission.id, groupBy.id) AS CountedRows;
    `

    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) => {
        return rows
          .map((i: any) => ({
            ...i,
            groupBy: { id: i.groupById, name: i.groupByName },
            activities: JSON.parse(i.activities) ?? [],
          }))

          .map(calculate_PE_co2e({}))
      }) as Promise<
        {
          activities: TActivity
          category: string
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

export const calculate_PE_co2e = curry((config: {
  useDebug?: boolean
}, emission: EmissionScope1ProcessEmissionWithRelations) => {
  config = { ...config, useDebug: config.useDebug ?? EnvConfig.isDev }

  return {
    ...emission,
    activities: flow(
      (activities) =>
        activities.reduce(
          (acc: TActivity, current: EmissionScope1ProcessEmissionActivity) => {
            if (!current.date) return acc

            const [year, month] = format(new Date(current.date), 'yyyy-M-dd').split('-')
            const co2e = new Decimal(current.input).toDecimalPlaces(2)

            const path = `${year}.${month}`
            const val = _get(acc, path, new Decimal(0)).add(co2e)
            setWith(acc, path, val, Object)

            return acc
          },
          {} as TActivity,
        ),
      kgToTon,
    )(emission.activities ?? []),
  }
})

