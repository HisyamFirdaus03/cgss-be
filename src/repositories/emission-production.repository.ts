import { Constructor, Getter, inject } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionProduction,
  EmissionProductionActivity,
  EmissionProductionRelations,
  EmissionProductionWithRelations,
  GroupBy,
} from '../models'
import {
  EmissionProductionActivityRepository,
  GroupByRepository,
  TimeStampRepositoryMixin,
  UserRepository,
} from '../repositories'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common/'
import { curry, flow, get as _get, setWith } from 'lodash'
import { Decimal } from 'decimal.js'

export class EmissionProductionRepository extends TimeStampRepositoryMixin<
  EmissionProduction,
  typeof EmissionProduction.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionProduction,
      typeof EmissionProduction.prototype.id,
      EmissionProductionRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionProduction.prototype.id>
  public readonly activities: HasManyRepositoryFactory<
    EmissionProductionActivity,
    typeof EmissionProduction.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('EmissionProductionActivityRepository')
    protected emissionProductionActivityGetter: Getter<EmissionProductionActivityRepository>,
  ) {
    super(EmissionProduction, dataSource, userRepositoryGetter)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', emissionProductionActivityGetter)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionProduction>) {
    if (entity.category && entity.groupById) {
      const isAlreadyExist = await this.find({ where: { and: [{ category: entity.category }, { groupById: entity.groupById }] } })
      if (isAlreadyExist.length) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of category & group')
      }
    }
  }

  async create(entity: DataObject<EmissionProduction>, options?: Options): Promise<EmissionProduction> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(
    id: typeof EmissionProduction.prototype.id,
    data: DataObject<EmissionProduction>,
    options?: Options,
  ): Promise<void> {
    await this.isDuplicate(data)
    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionProduction.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionProductionActivityGetter()
    await activities.deleteAll({ emissionProductionId: id })

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
                               'id', Activity.id,
                               'input', Activity.input,
                               'date', Activity.date
                       )
               )            AS activities,
               pe_emission.category,
               pe_emission.id,
               pe_emission.status,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName
        FROM ${merged.db}.EmissionProduction AS pe_emission
                 LEFT JOIN
             ${merged.db}.EmissionProductionActivity AS Activity
             ON Activity.emissionProductionId = pe_emission.id
                 AND ${dateWhereClause}
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON groupBy.id = pe_emission.groupById
        WHERE ${whereClause}
        GROUP BY pe_emission.id, groupBy.id
            ${paginate};
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT pe_emission.id
              FROM ${merged.db}.EmissionProduction AS pe_emission
                       LEFT JOIN
                   ${merged.db}.EmissionProductionActivity AS Activity
                   ON Activity.emissionProductionId = pe_emission.id
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
          .map(transformEmissionProduction({}))
      }) as Promise<{
        activities: TActivity
        category: string
        id: number
        status: 'active' | 'inactive'
        groupById: number
        groupByName: string
      }[]>,
      merged.page
        ? this.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>
        : Promise.resolve(0),
    ])

    return { rows, rowCount }
  }
}

export const transformEmissionProduction = curry((config: {
  useDebug?: boolean
}, emission: EmissionProductionWithRelations) => {
  config = { ...config, useDebug: config.useDebug ?? EnvConfig.isDev }

  return {
    ...emission,
    activities: flow(
      (activities) =>
        activities.reduce(
          (acc: TActivity, current: EmissionProductionActivity) => {
            if (!current.date) return acc

            const date = new Date(current.date)
            //  TODO: change this month to be 0-based
            const [year, month] = [date.getFullYear(), date.getMonth() + 1]

            const co2e = new Decimal(current.input).toDecimalPlaces(2)

            const path = `${year}.${month}`
            const val = _get(acc, path, new Decimal(0)).add(co2e)
            setWith(acc, path, val, Object)

            return acc
          },
          {} as TActivity,
        ),
    )(emission.activities ?? []),
  }
})