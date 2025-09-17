import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  GroupBy,
  EmissionScope1StationaryCombustion,
  EmissionScope1StationaryCombustionActivity,
  EmissionScope1StationaryCombustionRelations,
} from '../models'
import {
  GroupByRepository,
  EmissionScope1StationaryCombustionActivityRepository,
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionFactorRepository,

} from '../repositories'
import { curry, flow, get as _get, setWith } from 'lodash'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common/'
import { kgToTon } from '../common/helpers'

export class EmissionScope1StationaryCombustionRepository extends TimeStampRepositoryMixin<
  EmissionScope1StationaryCombustion,
  typeof EmissionScope1StationaryCombustion.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1StationaryCombustion,
      typeof EmissionScope1StationaryCombustion.prototype.id,
      EmissionScope1StationaryCombustionRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope1StationaryCombustion.prototype.id>

  public readonly activities: HasManyRepositoryFactory<EmissionScope1StationaryCombustionActivity, typeof EmissionScope1StationaryCombustion.prototype.id> // prettier-ignore

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('EmissionScope1StationaryCombustionActivityRepository')
    protected emissionScope1StationaryCombustionDataGetter: Getter<EmissionScope1StationaryCombustionActivityRepository>, // prettier-ignore

    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(EmissionScope1StationaryCombustion, dataSource, userRepositoryGetter)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', emissionScope1StationaryCombustionDataGetter)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionScope1StationaryCombustion>) {
    if (entity.typeId && entity.groupById) {
      const isAlreadyExist = await this.find({ where: { and: [{ typeId: entity.typeId }, { groupById: entity.groupById }] } })

      if (isAlreadyExist.length) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of type & group')
      }
    }
  }

  async create(entity: DataObject<EmissionScope1StationaryCombustion>, options?: Options): Promise<EmissionScope1StationaryCombustion> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(
    id: typeof EmissionScope1StationaryCombustion.prototype.id,
    data: DataObject<EmissionScope1StationaryCombustion>,
    options?: Options,
  ): Promise<void> {
    await this.isDuplicate(data)
    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope1StationaryCombustion.prototype.id, options?: Options): Promise<void> {
    const activities = await this.emissionScope1StationaryCombustionDataGetter()
    await activities.deleteAll({ stationaryCombustionId: id })

    return super.deleteById(id, options)
  }

  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)

    const whereClause = `
        st_emission.id IS NOT NULL
        ${merged.q ? `AND st_emission.typeId LIKE '%${merged.q}%'` : ''}
        ${merged.groupByIds ? `AND groupBy.id IN (${merged.groupByIds})` : ''}
     `

    const dateWhereClause = `(Activity.date IS NULL OR (Activity.date >= '${merged.dateRange?.[0]}' AND Activity.date <= '${merged.dateRange?.[1]}'))`

    const paginate = merged.page ? `
        ORDER BY ${merged.sorting ?? 'ef.name ASC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0}
    ` : ''


    const mainQuery = `
        SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                               'input', Activity.input,
                               'date', Activity.date
                       )
               )            AS activities,
               st_emission.id,
               st_emission.status,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName,
               st_emission.typeId,
               JSON_OBJECT(
                       'fuel_types', ef.fuel_types,
                       'id', ef.id,
                       'name', ef.name,
                       'state', ef.state,
                       'unit', ef.unit
               )            AS type
        FROM ${merged.db}.EmissionScope1StationaryCombustion AS st_emission
                 LEFT JOIN
             ${merged.db}.EmissionScope1StationaryCombustionActivity AS Activity
             ON Activity.stationaryCombustionId = st_emission.id
                 AND ${dateWhereClause}
                 LEFT JOIN
             ${merged.db}.GroupBy AS groupBy
             ON groupBy.id = st_emission.groupById
                 LEFT JOIN
             (SELECT JSON_UNQUOTE(JSON_EXTRACT(ef_st.value, '$.fuel_types')) AS fuel_types,
                     JSON_UNQUOTE(JSON_EXTRACT(ef_st.value, '$.id'))         AS id,
                     JSON_UNQUOTE(JSON_EXTRACT(ef_st.value, '$.name'))       AS name,
                     JSON_UNQUOTE(JSON_EXTRACT(ef_st.value, '$.state'))      AS state,
                     JSON_UNQUOTE(JSON_EXTRACT(ef_st.value, '$.unit'))       AS unit
              FROM cgss__main.EmissionFactor,
                   JSON_TABLE(
                           EmissionFactor.stationary_combustion,
                           '$[*]' COLUMNS (value JSON PATH '$')
                   ) AS ef_st) AS ef
             ON st_emission.typeId = ef.id
        WHERE ${whereClause}
        GROUP BY st_emission.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT st_emission.id
              FROM ${merged.db}.EmissionScope1StationaryCombustion AS st_emission
                       LEFT JOIN
                   ${merged.db}.EmissionScope1StationaryCombustionActivity AS Activity
                   ON Activity.stationaryCombustionId = st_emission.id
                       AND ${dateWhereClause}
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON groupBy.id = st_emission.groupById
              WHERE ${whereClause}
              GROUP BY st_emission.id, groupBy.id) AS CountedRows;
    `

    const EF_ST = await this.emissionFactorRepository.analysisEmissionFactor({
      stationary_combustion: true,
      EF: merged.EF,
    })

    const calc = calculate_ST_Co2e(EF_ST, { useDebug: merged.useDebug })

    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) =>
        rows.map((i: any) => ({
          ...i,
          type: JSON.parse(i.type || '{}'),
          activities: JSON.parse(i.activities || '[]'),
        })).map(calc),
      ) as Promise<
        {
          activities: TActivity['activities']
          typeId: string
          type: {}
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

export const calculate_ST_Co2e = curry(
  (
    {
      selectProperYear,
      mapYearsToEmissionFactors,
      minYear,
    }: Awaited<ReturnType<EmissionFactorRepository['analysisEmissionFactor']>>,
    config: { useDebug?: boolean },
    emission: EmissionScope1StationaryCombustion,
  ) => {
    /**
     * group all inputs into by year and month,
     * { ... data: { <years>: { 1: 3080.18 (co2e), ... months 12: 4594.24(co2e) } }}
     * */
    return {
      ...emission,
      activities: flow(
        (activities) =>
          activities.reduce(
            (acc: TActivity, current: EmissionScope1StationaryCombustionActivity) => {
              if (!current.date) return acc

              const [year, month] = format(new Date(current.date), 'yyyy-M-dd').split('-')
              const yearToSelect = selectProperYear(year)
              const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

              const foundEmission = emissionFactorSelected.stationary_combustion[emission.typeId]
              if (!foundEmission) throw Error(`unable to find emission.typeId: ${emission.typeId}`)

              // for stationary combustion will have HHV
              // A = (input x HHV x CO2 factor), B = (input x HHV x CH4 factor), C = (input x HHV x N2O factor),
              // CO2E = (A x GWP.CO2 + B x GWP.CH4 + C x GWP.N2O)
              const input_HHV = current.input * foundEmission.heat_content

              const co2e = new Decimal(
                (input_HHV * foundEmission.CO2 * emissionFactorSelected.GWP.CO2) +
                (input_HHV * foundEmission.CH4 * emissionFactorSelected.GWP.CH4) +
                (input_HHV * foundEmission.N2O * emissionFactorSelected.GWP.N2O),
              ).toDecimalPlaces(2) // prettier-ignore

              if (config.useDebug || EnvConfig.isDev) {
                setWith(acc, `${year}.emission`, { emissionFactorYear: yearToSelect, ...foundEmission })

                // @ts-ignore
                const prev = acc?.[year]?.detail?.[month] ?? []
                const _debugs = debugs({
                  input: current.input,
                  foundEmission,
                  GWP: mapYearsToEmissionFactors[yearToSelect].GWP,
                })
                prev.push({ CO2: _debugs('CO2'), CH4: _debugs('CH4'), N2O: _debugs('N2O'), co2e })

                setWith(acc, `${year}.detail.${month}`, prev)
              }

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
  },
)

const debugs =
  ({ input, foundEmission, GWP }: any) =>
    (symbol: string) =>
      `${input} * ${foundEmission.heat_content} * ${foundEmission[symbol]} * ${GWP[symbol]} = ${input * foundEmission.heat_content * foundEmission[symbol] * GWP[symbol]}`
