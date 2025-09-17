import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { UserRepository, TimeStampRepositoryMixin, EmissionFactorRepository, EmissionScope2Repository } from '../repositories'
import { EmissionScope2Activity, EmissionScope2ActivityRelations } from '../models/emission-scope-2-activity.model'
import { DatabaseConfig, EnvConfig } from '../configurations/secrets'
import { HttpErrors } from '@loopback/rest'
import { queryDataInMonthOf, turnOfUserModifiableFields } from '../common'
import { Decimal } from 'decimal.js'
import { EmissionFactor, EmissionScope2 } from '../models'

export class EmissionScope2ActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope2Activity,
  typeof EmissionScope2Activity.prototype.id,
  Constructor<DefaultCrudRepository<EmissionScope2Activity, typeof EmissionScope2Activity.prototype.id, EmissionScope2ActivityRelations>>
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionScope2, typeof EmissionScope2Activity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope2Repository')
    protected emissionScope2Repository: Getter<EmissionScope2Repository>,

    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository
  ) {
    super(EmissionScope2Activity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope2Repository)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }

  async getOptimizedActivitiesAtYear(payload: { scope2Id: number; year: number; month: number }) {
    const { selectProperYear, mapYearsToEmissionFactors } = await this.emissionFactorRepository.analysisEmissionFactor({
      scope2: true,
    })
    const { scope2Id, year, month } = payload

    const parentRepo = await this.emissionScope2Repository()
    const foundScope2 = await parentRepo.findOne({ where: { id: scope2Id }, fields: ['id', 'type', 'location'] })

    if (!foundScope2) throw HttpErrors[422]('Unable able to find scope2Id in parentRepo')

    const yearToSelect = selectProperYear(year)
    const emissionFactorSelected = mapYearsToEmissionFactors[yearToSelect]
    const foundEmission = emissionFactorSelected.scope2[foundScope2.type]

    const foundActivities = await this.find({
      fields: turnOfUserModifiableFields,
      order: ['date'],
      where: { scope2Id, and: queryDataInMonthOf(year, month) },
    })

    // TODO: need to merge together in parent > optimized api repo
    return foundActivities.map((i) => {
      const isDev = EnvConfig.isDev ? { emission: foundEmission, GWP: emissionFactorSelected.GWP } : {}

      if (foundScope2.type === 'electric') {
        const gwpLocation = (foundEmission as EmissionFactor['scope2']['electric'])[foundScope2.location]
        const CO2E = new Decimal(i.input * gwpLocation)

        return {
          ...i,
          CO2E: CO2E.dividedBy(1000).toDecimalPlaces(2).toNumber(),
          ...isDev,
        }
      } else {
        // heating, cooling, steam
        const emission = foundEmission as EmissionFactor['scope2']['heat']

        const CO2 = new Decimal(i.input * emission.CO2 * emissionFactorSelected.GWP.CO2)
        const CH4 = new Decimal(i.input * emission.CH4 * emissionFactorSelected.GWP.CH4)
        const N2O = new Decimal(i.input * emission.N2O * emissionFactorSelected.GWP.N2O)

        return {
          ...i,
          CO2: CO2.toDecimalPlaces(2).toNumber(),
          CH4: CH4.toDecimalPlaces(2).toNumber(),
          N2O: N2O.toDecimalPlaces(2).toNumber(),
          CO2E: CO2.plus(CH4).plus(N2O).dividedBy(1000).toDecimalPlaces(2).toNumber(),
          ...isDev,
        }
      }
    })
  }
}
