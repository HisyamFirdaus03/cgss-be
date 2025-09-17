import { inject, Getter, Constructor } from '@loopback/core'
import { repository, HasManyRepositoryFactory, BelongsToAccessor, DefaultCrudRepository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  GroupBy,
  EmissionScope1FugitiveEmission,
  EmissionScope1FugitiveEmissionRelations,
  EmissionScope1FugitiveEmissionActivity,
} from '../models'
import {
  GroupByRepository,
  EmissionScope1FugitiveEmissionActivityRepository,
  UserRepository,
  TimeStampRepositoryMixin,
} from '../repositories'
import { curry, flow, get as _get, setWith } from 'lodash'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common/'
import { kgToTon } from '../common/helpers'

export class EmissionScope1FugitiveEmissionRepository extends TimeStampRepositoryMixin<
  EmissionScope1FugitiveEmission,
  typeof EmissionScope1FugitiveEmission.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1FugitiveEmission,
      typeof EmissionScope1FugitiveEmission.prototype.id,
      EmissionScope1FugitiveEmissionRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope1FugitiveEmission.prototype.id>
  public readonly activities: HasManyRepositoryFactory<
    EmissionScope1FugitiveEmissionActivity,
    typeof EmissionScope1FugitiveEmission.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('EmissionScope1FugitiveEmissionActivityRepository')
    protected emissionScope1FugitiveEmissionActivityGetter: Getter<EmissionScope1FugitiveEmissionActivityRepository>,
  ) {
    super(EmissionScope1FugitiveEmission, dataSource, userRepositoryGetter)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', emissionScope1FugitiveEmissionActivityGetter)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionScope1FugitiveEmission>) {
    if (entity.category && entity.groupById) {
      const isAlreadyExist = await this.find({ where: { and: [{ category: entity.category }, { groupById: entity.groupById }] } })
      if (isAlreadyExist.length) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of category & group')
      }
    }
  }

  async create(entity: DataObject<EmissionScope1FugitiveEmission>, options?: Options): Promise<EmissionScope1FugitiveEmission> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(
    id: typeof EmissionScope1FugitiveEmission.prototype.id,
    data: DataObject<EmissionScope1FugitiveEmission>,
    options?: Options,
  ): Promise<void> {
    await this.isDuplicate(data)
    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope1FugitiveEmission.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionScope1FugitiveEmissionActivityGetter()
    await activities.deleteAll({ fugitiveEmissionId: id })

    return super.deleteById(id, options)
  }

  /**
   * FUGITIVE KIV dulu sebab user flow tok masuk kan input mcam2 jenis
   * aircond, chemical leakage bagai.
   */
  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)

    const whereClause = `
        fe_emission.id IS NOT NULL
        ${merged.q ? `AND fe_emission.category LIKE '%${merged.q}%'` : ''}
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
               fe_emission.category,
               fe_emission.id,
               fe_emission.status,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName
        FROM ${merged.db}.EmissionScope1FugitiveEmission AS fe_emission
                 LEFT JOIN
             ${merged.db}.EmissionScope1FugitiveEmissionActivity AS Activity
             ON Activity.fugitiveEmissionId = fe_emission.id
                 AND ${dateWhereClause}
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON groupBy.id = fe_emission.groupById
        WHERE ${whereClause}
        GROUP BY fe_emission.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT fe_emission.id
              FROM ${merged.db}.EmissionScope1FugitiveEmission AS fe_emission
                       LEFT JOIN
                   ${merged.db}.EmissionScope1FugitiveEmissionActivity AS Activity
                   ON Activity.fugitiveEmissionId = fe_emission.id
                       AND ${dateWhereClause}
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON groupBy.id = fe_emission.groupById
              WHERE ${whereClause}
              GROUP BY fe_emission.id, groupBy.id) AS CountedRows;
    `

    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) => {
        return rows
          .map((i: any) => ({
            ...i,
            groupBy: { id: i.groupById, name: i.groupByName },
            activities: JSON.parse(i.activities) ?? [],
          }))

          .map(calculate_FE_co2e({}))
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

export const calculate_FE_co2e = curry((config: { useDebug?: boolean }, emission: EmissionScope1FugitiveEmission) => {
  config = { ...config, useDebug: config.useDebug ?? EnvConfig.isDev }

  return {
    id: emission.id,
    category: emission.category,
    status: emission.status,
    activities: flow(
      (activities) =>
        activities.reduce(
          (acc: TActivity, current: EmissionScope1FugitiveEmissionActivity) => {
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
