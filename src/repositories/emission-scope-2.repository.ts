import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope2Activity,
  EmissionScope2,
  EmissionScope2Relations,
  GroupBy,
  EmissionFactor,
  EmissionScope2WithRelations,
} from '../models'
import {
  GroupByRepository,
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionScope2ActivityRepository,
  EmissionFactorRepository,

} from '../repositories'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common'
import { curry, flow, get as _get, setWith } from 'lodash'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'

export class EmissionScope2Repository extends TimeStampRepositoryMixin<
  EmissionScope2,
  typeof EmissionScope2.prototype.id,
  Constructor<DefaultCrudRepository<EmissionScope2, typeof EmissionScope2.prototype.id, EmissionScope2Relations>>
>(DefaultCrudRepository) {
  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope2.prototype.id>
  public readonly activities: HasManyRepositoryFactory<EmissionScope2Activity, typeof EmissionScope2.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('EmissionScope2ActivityRepository')
    protected emissionScope2ActivityRepository: Getter<EmissionScope2ActivityRepository>,
    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(EmissionScope2, dataSource, userRepositoryGetter)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', emissionScope2ActivityRepository)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionScope2>) {
    if (entity.category && entity.groupById && entity.type) {
      const isAlreadyExist = await this.find({
        where: { and: [{ type: entity.type }, { groupById: entity.groupById }, { category: entity.category }] },
      })

      if (isAlreadyExist.length) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of type & group & category')
      }
    }
  }

  async create(entity: DataObject<EmissionScope2>, options?: Options): Promise<EmissionScope2> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(id: typeof EmissionScope2.prototype.id, data: DataObject<EmissionScope2>, options?: Options): Promise<void> {
    await this.isDuplicate(data)
    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope2.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionScope2ActivityRepository()
    await activities.deleteAll({ scope2Id: id })

    return super.deleteById(id, options)
  }

  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)

    const whereClause = `
        scope2.id IS NOT NULL
        ${merged.q ? `AND scope2.category LIKE '%${merged.q}%'` : ''}
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
               scope2.category,
               scope2.id,
               scope2.type,
               scope2.location,
               scope2.status,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName
        FROM ${merged.db}.EmissionScope2 AS scope2
                 LEFT JOIN
             ${merged.db}.EmissionScope2Activity AS Activity
             ON Activity.scope2Id = scope2.id
                 AND ${dateWhereClause}
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON groupBy.id = scope2.groupById
        WHERE ${whereClause}
        GROUP BY scope2.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT scope2.id
              FROM ${merged.db}.EmissionScope2 AS scope2
                       LEFT JOIN
                   ${merged.db}.EmissionScope2Activity AS Activity
                   ON Activity.scope2Id = scope2.id
                       AND ${dateWhereClause}
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON groupBy.id = scope2.groupById
              WHERE ${whereClause}
              GROUP BY scope2.id, groupBy.id) AS CountedRows;
    `

    const EF_Scope2 = await this.emissionFactorRepository.analysisEmissionFactor({ scope2: true, EF: merged.EF })
    const calc = calculate_Scope2_co2e(EF_Scope2, { useDebug: merged.useDebug })

    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) =>
        rows.map((i: any) => ({ ...i, activities: JSON.parse(i.activities) ?? [] })).map(calc),
      ) as Promise<
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

export const calculate_Scope2_co2e = curry(
  (
    {
      selectProperYear,
      mapYearsToEmissionFactors,
    }: Awaited<ReturnType<EmissionFactorRepository['analysisEmissionFactor']>>,
    config: { useDebug?: boolean },
    scope2: EmissionScope2WithRelations,
  ) => {
    return {
      ...scope2,
      activities: flow(
        (activities) =>
          activities.reduce(
            (acc: TActivity, current: EmissionScope2Activity) => {
              if (!current.date) return acc

              const [year, month] = format(new Date(current.date), 'yyyy-M-dd').split('-')
              const yearToSelect = selectProperYear(year)
              const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

              const foundEmission = emissionFactorSelected.scope2[scope2.type]
              if (!foundEmission) throw Error(`unable to find EmissionFactor for emission.type: ${scope2.type} as scope2.id: ${scope2.id}}`)

              let co2e: Decimal
              if (scope2.type === 'electric') {
                const gwpLocation = (foundEmission as EmissionFactor['scope2']['electric'])[scope2.location]
                co2e = new Decimal(current.input * gwpLocation)
              } else {
                // heating, cooling, steam
                const emission = foundEmission as EmissionFactor['scope2']['heat']

                co2e = new Decimal(
                  (current.input * emission.CO2 * emissionFactorSelected.GWP.CO2) +
                  (current.input * emission.CH4 * emissionFactorSelected.GWP.CH4) +
                  (current.input * emission.N2O * emissionFactorSelected.GWP.N2O),
                ) // prettier-ignore
              }

              const val = new Decimal(_get(acc, `${year}.${month}`, 0)).add(co2e)
              setWith(acc, `${year}.${month}`, val, Object)

              if (config.useDebug || EnvConfig.isDev) {
                setWith(acc, `${year}.emission`, { emissionFactorYear: yearToSelect, ...emissionFactorSelected.scope2[scope2.type] })

                // @ts-ignore
                const prev = acc?.[year]?.detail?.[month] ?? []
                const _debugs = debugs({
                  type: scope2.type,
                  input: current.input,
                  foundEmission,
                  GWP: emissionFactorSelected.GWP,
                })

                prev.push(
                  scope2.type === 'electric'
                    ? debugsElectric({
                      input: current.input,
                      location: scope2.location,
                      foundEmission: foundEmission as EmissionFactor['scope2']['electric'],
                    })
                    : { CO2: _debugs('CO2'), CH4: _debugs('CH4'), N2O: _debugs('N2O'), co2e },
                )

                setWith(acc, `${year}.detail.${month}`, prev)
              }

              return acc
            },
            {} as TActivity,
          ),
      )(scope2.activities ?? []),
    }
  },
)

const debugsElectric = ({
                          input,
                          foundEmission,
                          location,
                        }: {
  input: number
  foundEmission: EmissionFactor['scope2']['electric']
  location: 'peninsular' | 'sabah' | 'sarawak'
}) => {
  const locationEmission = foundEmission[location]
  return `${input} * ${locationEmission}(${location}) = ${input * locationEmission}`
}

const debugs =
  ({ input, foundEmission, GWP }: any) =>
    (symbol: string) =>
      `${symbol}: ${input} * ${foundEmission.CO2} * ${GWP[symbol]} = ${input * foundEmission.CO2 * GWP[symbol]}`
