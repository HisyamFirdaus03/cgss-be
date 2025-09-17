import { Constructor, Getter, inject } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionFactor,
  EmissionScope3WasteGenerated,
  EmissionScope3WasteGeneratedActivity,
  EmissionScope3WasteGeneratedRelations,
  EmissionScope3WasteGeneratedWithRelations,
  GroupBy,
} from '../models'
import {
  EmissionFactorRepository,
  EmissionScope3WasteGeneratedActivityRepository,
  GroupByRepository,
  TimeStampRepositoryMixin,
  UserRepository,
} from '../repositories'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { BeforeTransform, TActivity, transformQueries } from '../common'
import { curry, flow, get as _get, setWith } from 'lodash'
import { format } from 'date-fns'
import { Decimal } from 'decimal.js'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { HttpErrors } from '@loopback/rest'

export class EmissionScope3WasteGeneratedRepository extends TimeStampRepositoryMixin<
  EmissionScope3WasteGenerated,
  typeof EmissionScope3WasteGenerated.prototype.id,
  Constructor<DefaultCrudRepository<EmissionScope3WasteGenerated, typeof EmissionScope3WasteGenerated.prototype.id, EmissionScope3WasteGeneratedRelations>>
>(DefaultCrudRepository) {
  public readonly groupBy: BelongsToAccessor<GroupBy, typeof EmissionScope3WasteGenerated.prototype.id>
  public readonly activities: HasManyRepositoryFactory<EmissionScope3WasteGeneratedActivity, typeof EmissionScope3WasteGenerated.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('GroupByRepository')
    protected groupByGetter: Getter<GroupByRepository>,
    @repository.getter('EmissionScope3WasteGeneratedActivityRepository')
    protected activityRepository: Getter<EmissionScope3WasteGeneratedActivityRepository>,
    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(EmissionScope3WasteGenerated, dataSource, userRepositoryGetter)

    this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByGetter)
    this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)

    this.activities = this.createHasManyRepositoryFactoryFor('activities', activityRepository)
    this.registerInclusionResolver('activities', this.activities.inclusionResolver)
  }

  private async isDuplicate(entity: DataObject<EmissionScope3WasteGenerated>) {
    if (entity.materialId && entity.groupById && entity.method) {
      const isAlreadyExist = await this.find({
        where: { and: [{ materialId: entity.materialId }, { groupById: entity.groupById }, { method: entity.method }] },
      })

      if (isAlreadyExist.length) {
        throw new HttpErrors[422]('Duplicate entry, please select different combination of material & groupBy & method')
      }
    }
  }

  async create(entity: DataObject<EmissionScope3WasteGenerated>, options?: Options): Promise<EmissionScope3WasteGenerated> {
    await this.isDuplicate(entity)
    return super.create(entity, options)
  }

  async updateById(id: typeof EmissionScope3WasteGenerated.prototype.id, data: DataObject<EmissionScope3WasteGenerated>, options?: Options): Promise<void> {
    const existingRecord = await this.findById(id)
    if (!existingRecord) throw new HttpErrors[404]('Record not found')

    const isSameCategoryChangeOnly =
      existingRecord.materialId === data.materialId &&
      existingRecord.groupById === data.groupById &&
      existingRecord.method === data.method &&
      existingRecord.category !== data.category // Only category is changed

    if (!isSameCategoryChangeOnly) {
      await this.isDuplicate(data)
    }

    return super.updateById(id, data, options)
  }

  // cascading delete
  async deleteById(id: typeof EmissionScope3WasteGenerated.prototype.id, options?: Options): Promise<void> {
    const activities = await this.activityRepository()
    await activities.deleteAll({ wasteGeneratedId: id })

    return super.deleteById(id, options)
  }

  async optimize(params: BeforeTransform) {
    const merged = transformQueries(params)

    const whereClause = `
        wg.id IS NOT NULL
        ${merged.q ? `AND (wg.method LIKE '%${merged.q}%' OR wg.materialId LIKE '%${merged.q}%' OR wg.category LIKE '%${merged.q}%' OR wg.type LIKE '%${merged.q}%')` : ''}
        ${merged.groupByIds ? `AND groupBy.id IN (${merged.groupByIds})` : ''}
        ${merged.dateRange?.[0] ? `AND (Activity.date >= '${merged.dateRange[0]}' OR Activity.date IS NULL)` : ''}
        ${merged.dateRange?.[1] ? `AND (Activity.date <= '${merged.dateRange[1]}' OR Activity.date IS NULL)` : ''}
     `

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
               wg.type,
               wg.category,
               wg.id,
               wg.materialId,
               wg.method,
               wg.status,
               groupBy.id   AS groupById,
               groupBy.name AS groupByName
        FROM ${merged.db}.EmissionScope3WasteGenerated AS wg
                 LEFT JOIN
             ${merged.db}.EmissionScope3WasteGeneratedActivity AS Activity
             ON Activity.wasteGeneratedId = wg.id
                 LEFT JOIN
             ${merged.db}.GroupBy as groupBy
             ON groupBy.id = wg.groupById
        WHERE ${whereClause}
        GROUP BY wg.id, groupBy.id
            ${paginate}
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT wg.id
              FROM ${merged.db}.EmissionScope3WasteGenerated AS wg
                       LEFT JOIN
                   ${merged.db}.EmissionScope3WasteGeneratedActivity AS Activity
                   ON Activity.wasteGeneratedId = wg.id
                       LEFT JOIN
                   ${merged.db}.GroupBy as groupBy
                   ON groupBy.id = wg.groupById
              WHERE ${whereClause}
              GROUP BY wg.id, groupBy.id) AS CountedRows;
    `

    const EF_WasteGenerated = await this.emissionFactorRepository.analysisEmissionFactor({
      waste_generated: true,
      waste_generated_supplier_specific_method: true,
      EF: merged.EF,
    })
    const calc = calculate_WG_co2e(EF_WasteGenerated, { useDebug: merged.useDebug })

    const dropdownWasteMethod1Generated = await this.emissionFactorRepository.dropdown('waste_generated_supplier_specific_method')
    const dropdownWasteMethod2Generated = await this.emissionFactorRepository.dropdown('waste_generated')
    const dropdownWasteTypeSpecificMethod = this.emissionFactorRepository.waste_generated()

    const [rows, rowCount] = await Promise.all([
      this.execute(mainQuery).then((rows) =>
        rows.map((wg: EmissionScope3WasteGenerated & { activities: string, groupByName: string }) => {
          let temp = {}
          if (wg.type === 'waste_type_specific_method') {
            temp = {
              materialIdHuman: dropdownWasteMethod2Generated.find(i => i!.id === wg.materialId)!.material,
              methodHuman: dropdownWasteTypeSpecificMethod['waste_type_specific_method'].find(i => i.id === wg.method)!.name,
            }

          } else {
            temp = {
              materialIdHuman: dropdownWasteMethod1Generated.find(i => i!.id === wg.materialId)?.name,
              methodHuman: '',
            }
          }

          return ({
            ...wg,
            ...temp,
            activities: JSON.parse(wg.activities) ?? [],
            groupBy: { id: wg.groupById, name: wg.groupByName },
          })
        })
          .map(calc),
      ) as Promise<{
        method: EmissionScope3WasteGenerated['method']
        materialId: EmissionScope3WasteGenerated['materialId']
        id: number
        activities: TActivity
        status: EmissionScope3WasteGenerated['status']
        groupById: number
        groupByName: string
        type: EmissionScope3WasteGenerated['type']
      }[]
      >,
      this.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>,
    ])

    return { rows, rowCount }
  }
}

export const calculate_WG_co2e = curry(
  (
    {
      selectProperYear,
      mapYearsToEmissionFactors,
    }: Awaited<ReturnType<EmissionFactorRepository['analysisEmissionFactor']>>,
    config: { useDebug?: boolean },
    wasteGenerated: EmissionScope3WasteGeneratedWithRelations,
  ) => {
    return {
      ...wasteGenerated,
      activities: flow(
        (activities) =>
          activities.reduce(
            (acc: TActivity, current: EmissionScope3WasteGeneratedActivity) => {
              if (!current.date) return acc

              const [year, month] = format(new Date(current.date), 'yyyy-M-dd').split('-')
              const yearToSelect = selectProperYear(year)
              const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

              const isMethod2 = wasteGenerated.type === 'waste_type_specific_method'
              const method1 = emissionFactorSelected['waste_generated_supplier_specific_method']
              const method2 = emissionFactorSelected['waste_generated']
              const emissionWaste = isMethod2 ? method2 : method1

              const foundEmission = emissionWaste[wasteGenerated.materialId]

              if (!foundEmission) throw Error(`unable to find EmissionFactor for material: ${wasteGenerated.materialId} as wasteGenerated.id: ${wasteGenerated.id}}`)

              const m2 = ((foundEmission as EmissionFactor['waste_generated'][number])?.[wasteGenerated.method]) ?? 0
              const m1 = (foundEmission as EmissionFactor['waste_generated_supplier_specific_method'][number])?.value ?? 0
              const value = isMethod2 ? m2 : m1

              // @ts-ignore
              const co2e = new Decimal(value ?? 0).mul(current.input)

              const val = new Decimal(_get(acc, `${year}.${month}`, 0)).add(co2e)
              setWith(acc, `${year}.${month}`, val, Object)

              if (config.useDebug || EnvConfig.isDev) {
                setWith(acc, `${year}.emission`, { emissionFactorYear: yearToSelect, ...emissionFactorSelected.waste_generated[wasteGenerated.materialId] })

                // @ts-ignore
                const prev = acc?.[year]?.detail?.[month] ?? []

                const _debugs = debugs({
                  materialId: wasteGenerated.materialId,
                  method: wasteGenerated.method,
                  input: current.input,
                  foundEmission,
                })

                prev.push({ co2e: _debugs })

                setWith(acc, `${year}.detail.${month}`, prev)
              }

              return acc
            },
            {} as TActivity,
          ),
        // kgToTon,
      )(wasteGenerated.activities ?? []),
    }
  },
)

const debugs =
  ({ input, foundEmission, method }: any) =>
    // (symbol: string) =>
    `${input} * ${foundEmission?.[method] ?? 0} = ${input * (foundEmission?.[method] ?? 0)}`
