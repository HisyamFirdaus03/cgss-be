import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { EmissionScope1StationaryCombustion, EmissionScope1StationaryCombustionActivity, EmissionScope1StationaryCombustionActivityRelations } from '../models' // prettier-ignore
import {
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionScope1StationaryCombustionRepository,
  EmissionFactorRepository,
} from '../repositories'
import { HttpErrors } from '@loopback/rest'
import { Decimal } from 'decimal.js'
import { queryDataInMonthOf, turnOfUserModifiableFields } from '../common/model-filter-helpers'
import { EnvConfig } from '../configurations/secrets'
import { DatabaseConfig } from '../configurations/secrets'

export class EmissionScope1StationaryCombustionActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope1StationaryCombustionActivity,
  typeof EmissionScope1StationaryCombustionActivity.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1StationaryCombustionActivity,
      typeof EmissionScope1StationaryCombustionActivity.prototype.id,
      EmissionScope1StationaryCombustionActivityRelations
    >
  >
>(DefaultCrudRepository) {
  // prettier-ignore
  public readonly belongsTo: BelongsToAccessor<EmissionScope1StationaryCombustion, typeof EmissionScope1StationaryCombustionActivity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope1StationaryCombustionRepository')
    protected emissionScope1StationaryCombustionGetter: Getter<EmissionScope1StationaryCombustionRepository>,

    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository
  ) {
    super(EmissionScope1StationaryCombustionActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope1StationaryCombustionGetter)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }

  async getOptimizedActivitiesAtYear(payload: { stationaryCombustionId: number; year: number; month: number }) {
    const { selectProperYear, mapYearsToEmissionFactors } = await this.emissionFactorRepository.analysisEmissionFactor({
      stationary_combustion: true,
    })
    const { stationaryCombustionId, year, month } = payload

    const parentRepo = await this.emissionScope1StationaryCombustionGetter()
    const foundTypeId = await parentRepo.findOne({ where: { id: stationaryCombustionId }, fields: ['id', 'typeId'] })
    if (!foundTypeId) throw HttpErrors[422]('Unable able to find stationaryCombustionId in parentRepo')

    const yearToSelect = selectProperYear(year)
    const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]
    const foundEmission = emissionFactorSelected.stationary_combustion[foundTypeId.typeId]

    const foundActivities = await this.find({
      fields: turnOfUserModifiableFields,
      order: ['date'],
      where: { stationaryCombustionId, and: queryDataInMonthOf(year, month) },
    })

    // TODO: need to merge together in parent > optimized api repo
    return foundActivities.map((i) => {
      const CO2 = new Decimal(i.input * foundEmission.heat_content * foundEmission.CO2 * emissionFactorSelected.GWP.CO2)
      const CH4 = new Decimal(i.input * foundEmission.heat_content * foundEmission.CH4 * emissionFactorSelected.GWP.CH4)
      const N2O = new Decimal(i.input * foundEmission.heat_content * foundEmission.N2O * emissionFactorSelected.GWP.N2O)

      return {
        ...i,
        CO2: CO2.toDecimalPlaces(2).toNumber(),
        CH4: CH4.toDecimalPlaces(2).toNumber(),
        N2O: N2O.toDecimalPlaces(2).toNumber(),
        CO2E: CO2.plus(CH4).plus(N2O).dividedBy(1000).toDecimalPlaces(2).toNumber(),
        ...(EnvConfig.isDev ? { emission: foundEmission, GWP: emissionFactorSelected.GWP } : {}),
      }
    })
  }
}
