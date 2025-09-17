import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope1MobileCombustion,
  EmissionScope1MobileCombustionActivity,
  EmissionScope1MobileCombustionActivityRelations,
} from '../models'
import {
  UserRepository,
  EmissionScope1MobileCombustionRepository,
  TimeStampRepositoryMixin,
  EmissionFactorRepository,
  findMobileCombustion,
} from '../repositories'
import { HttpErrors } from '@loopback/rest'
import { queryDataInMonthOf, turnOfUserModifiableFields } from '../common'
import Decimal from 'decimal.js'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'

export class EmissionScope1MobileCombustionActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope1MobileCombustionActivity,
  typeof EmissionScope1MobileCombustionActivity.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1MobileCombustionActivity,
      typeof EmissionScope1MobileCombustionActivity.prototype.id,
      EmissionScope1MobileCombustionActivityRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionScope1MobileCombustion, typeof EmissionScope1MobileCombustionActivity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope1MobileCombustionRepository')
    protected emissionScope1MobileCombustionRepository: Getter<EmissionScope1MobileCombustionRepository>,

    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository
  ) {
    super(EmissionScope1MobileCombustionActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope1MobileCombustionRepository)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }

  async getOptimizedActivitiesAtYear(payload: { mobileCombustionId: number; year: number; month: number }) {
    const { selectProperYear, mapYearsToEmissionFactors } = await this.emissionFactorRepository.analysisEmissionFactor({
      mobile_combustion: true,
    })
    const { mobileCombustionId, year, month } = payload

    const parentRepo = await this.emissionScope1MobileCombustionRepository()
    const foundMobileRegistry = await parentRepo.findOne({
      where: { id: mobileCombustionId },
      fields: ['id', 'mobileRegistryId'],
      include: [{ relation: 'mobileRegistry', scope: { fields: turnOfUserModifiableFields } }],
    })

    if (!foundMobileRegistry) throw HttpErrors[422]('Unable able to find mobileCombustionId in parentRepo')

    const yearToSelect = selectProperYear(year)
    const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

    const foundMCEmission = findMobileCombustion(
      emissionFactorSelected.mobile_combustion,
      foundMobileRegistry.mobileRegistry.EF_MobileCombustionDistanceId
    )

    const foundActivities = await this.find({
      fields: turnOfUserModifiableFields,
      order: ['date'],
      where: { mobileCombustionId, and: queryDataInMonthOf(year, month) },
    })

    return foundActivities.map((activity) => {
      const currentType = {
        distance: { CO2: foundMCEmission.CO2, CH4: foundMCEmission.CH4, N2O: foundMCEmission.N2O },
        litre: { CO2: foundMCEmission.litre!?.CO2, CH4: foundMCEmission.litre!?.CH4, N2O: foundMCEmission.litre!?.N2O },
      }[foundMCEmission.litre ? activity.type : 'distance']

      const CO2 = new Decimal(activity.input * currentType.CO2 * emissionFactorSelected.GWP.CO2)
      const CH4 = new Decimal(activity.input * currentType.CH4 * emissionFactorSelected.GWP.CH4)
      const N2O = new Decimal(activity.input * currentType.N2O * emissionFactorSelected.GWP.N2O)

      return {
        ...activity,
        CO2: CO2.toDecimalPlaces(2).toNumber(),
        CH4: CH4.toDecimalPlaces(2).toNumber(),
        N2O: N2O.toDecimalPlaces(2).toNumber(),
        CO2E: CO2.plus(CH4).plus(N2O).dividedBy(1000).toDecimalPlaces(2).toNumber(),
        ...(EnvConfig.isDev ? { emission: foundMCEmission, GWP: emissionFactorSelected.GWP } : {}),
      }
    })
  }
}
