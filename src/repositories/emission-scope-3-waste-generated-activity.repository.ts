import {Constructor, Getter, inject} from '@loopback/core'
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository'
import {HttpErrors} from '@loopback/rest'
import {Decimal} from 'decimal.js'
import {queryDataInMonthOf, turnOfUserModifiableFields} from '../common'
import {DatabaseConfig, EnvConfig} from '../configurations/secrets'
import {DemoDataSource} from '../datasources'
import {
  EmissionFactor,
  EmissionScope3WasteGenerated,
  EmissionScope3WasteGeneratedActivity,
  EmissionScope3WasteGeneratedActivityRelations,
} from '../models'
import {
  EmissionFactorRepository,
  EmissionScope3WasteGeneratedRepository,
  TimeStampRepositoryMixin,
  UserRepository,
} from '../repositories'

export class EmissionScope3WasteGeneratedActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope3WasteGeneratedActivity,
  typeof EmissionScope3WasteGeneratedActivity.prototype.id,
  Constructor<DefaultCrudRepository<EmissionScope3WasteGeneratedActivity, typeof EmissionScope3WasteGeneratedActivity.prototype.id, EmissionScope3WasteGeneratedActivityRelations>>
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionScope3WasteGenerated, typeof EmissionScope3WasteGeneratedActivity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('EmissionScope3WasteGeneratedRepository')
    protected emissionScope3WasteGeneratedRepository: Getter<EmissionScope3WasteGeneratedRepository>,
    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository,
  ) {
    super(EmissionScope3WasteGeneratedActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope3WasteGeneratedRepository)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }

  async getOptimizedActivitiesAtYear(payload: {wasteGeneratedId: number; year: number; month: number}) {
    const {
      selectProperYear,
      mapYearsToEmissionFactors,
    } = await this.emissionFactorRepository.analysisEmissionFactor({waste_generated: true, waste_generated_supplier_specific_method: true})
    const {wasteGeneratedId, year, month} = payload

    const parentRepo = await this.emissionScope3WasteGeneratedRepository()
    const foundWaste = await parentRepo.findOne({
      where: {id: wasteGeneratedId},
      fields: ['id', 'materialId', 'method', 'type'], // Fetch type field
    })

    if (!foundWaste) throw HttpErrors[422]('Unable able to find wasteGeneratedId in parentRepo')

    const yearToSelect = selectProperYear(year)
    const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

    // Determine if it's method 2 based on type
    const isMethod2 = foundWaste.type === 'waste_type_specific_method'
    const method1Factors = emissionFactorSelected['waste_generated_supplier_specific_method']
    const method2Factors = emissionFactorSelected['waste_generated']
    const emissionWasteFactors = isMethod2 ? method2Factors : method1Factors

    const foundEmissionFactor = emissionWasteFactors[foundWaste.materialId]

    if (!foundEmissionFactor) throw Error(`unable to find EmissionFactor for material: ${foundWaste.materialId} as wasteGenerated.id: ${foundWaste.id}}`)

    const foundActivities = await this.find({
      fields: turnOfUserModifiableFields,
      order: ['date'],
      where: {wasteGeneratedId, and: queryDataInMonthOf(year, month)},
    })

    // TODO: need to merge together in parent > optimized api repo
    return foundActivities.map((i) => {
      const isDev = EnvConfig.isDev ? {emission: foundEmissionFactor, foundWaste} : {}

      // Extract the correct emission value based on type and method
      const m2 = ((foundEmissionFactor as EmissionFactor['waste_generated'][number])?.[foundWaste.method]) ?? 0
      const m1 = (foundEmissionFactor as EmissionFactor['waste_generated_supplier_specific_method'][number])?.value ?? 0
      const value = isMethod2 ? m2 : m1

      const CO2E = new Decimal(value ?? 0).mul(i.input)

      return {...i, ...isDev, CO2E: CO2E.toDecimalPlaces(2).toNumber()}
    })
  }
}
