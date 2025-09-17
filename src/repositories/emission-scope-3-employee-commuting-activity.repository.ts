import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope3EmployeeCommuting,
  EmissionScope3EmployeeCommutingActivity,
  EmissionScope3EmployeeCommutingActivityRelations,
} from '../models'
import {
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionFactorRepository,
  EmissionScope3EmployeeCommutingRepository,
  findMobileCombustion,
} from '../repositories'
import { queryDataInMonthOf, turnOfUserModifiableFields } from '../common'
import Decimal from 'decimal.js'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'

export class EmissionScope3EmployeeCommutingActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope3EmployeeCommutingActivity,
  typeof EmissionScope3EmployeeCommutingActivity.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope3EmployeeCommutingActivity,
      typeof EmissionScope3EmployeeCommutingActivity.prototype.id,
      EmissionScope3EmployeeCommutingActivityRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionScope3EmployeeCommuting, typeof EmissionScope3EmployeeCommutingActivity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope3EmployeeCommutingRepository')
    protected emissionScope3EmployeeCommutingRepository: Getter<EmissionScope3EmployeeCommutingRepository>,

    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository
  ) {
    super(EmissionScope3EmployeeCommutingActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope3EmployeeCommutingRepository)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }

  async getOptimizedActivitiesAtYear(payload: { employeeCommutingId: number; year: number; month: number }) {
    const { selectProperYear, mapYearsToEmissionFactors } = await this.emissionFactorRepository.analysisEmissionFactor({
      mobile_combustion: true,
    })
    const { employeeCommutingId, year, month } = payload

    const foundActivities = await this.find({
      fields: turnOfUserModifiableFields,
      where: { employeeCommutingId, and: queryDataInMonthOf(year, month) },
    })

    const yearToSelect = selectProperYear(year)
    const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]

    return foundActivities.map((activity) => {
      const avg_day_working_per_month = activity.input
      const { distance, EF_MobileCombustionDistanceId } = activity.metadata
      const foundEmission = findMobileCombustion(emissionFactorSelected.mobile_combustion, activity.metadata.EF_MobileCombustionDistanceId)

      const baseInput = new Decimal(avg_day_working_per_month).times(distance)

      const CO2 = baseInput.times(foundEmission.CO2).times(emissionFactorSelected.GWP.CO2)
      const CH4 = baseInput.times(foundEmission.CH4).times(emissionFactorSelected.GWP.CH4)
      const N2O = baseInput.times(foundEmission.N2O).times(emissionFactorSelected.GWP.N2O)

      return {
        ...activity,
        CO2: CO2.toDecimalPlaces(2).toNumber(),
        CH4: CH4.toDecimalPlaces(2).toNumber(),
        N2O: N2O.toDecimalPlaces(2).toNumber(),
        CO2E: CO2.plus(CH4).plus(N2O).dividedBy(1000).toDecimalPlaces(2).toNumber(),
        ...(EnvConfig.isDev ? { emission: foundEmission, GWP: emissionFactorSelected.GWP } : {}),
      }
    })
  }
}
