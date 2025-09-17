import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1StationaryCombustionActivity } from '../../models'
import { EmissionScope1StationaryCombustionActivityRepository, EmissionScope1StationaryCombustionRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { inject } from '@loopback/core'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1StationaryCombustionActivityController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1StationaryCombustionActivityRepository) public thisRepo: EmissionScope1StationaryCombustionActivityRepository,
    @repository(EmissionScope1StationaryCombustionRepository) public parentRepo: EmissionScope1StationaryCombustionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope1-stationary-combustion-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.create'] })
  @response(200, {
    description: 'EmissionScope1StationaryCombustionActivity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1StationaryCombustionActivity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1StationaryCombustionActivity, {
            title: 'NewEmissionScope1StationaryCombustionData',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope1StationaryCombustionData: Omit<EmissionScope1StationaryCombustionActivity, 'id'>
  ): Promise<EmissionScope1StationaryCombustionActivity> {
    const parentModels = await this.parentRepo.findById(emissionScope1StationaryCombustionData.stationaryCombustionId, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(emissionScope1StationaryCombustionData)
  }

  @get('/emission-scope1-stationary-combustion-activity')
  @response(200, {
    description: 'Array of EmissionScope1StationaryCombustionActivity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1StationaryCombustionActivity, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1StationaryCombustionActivity) filter?: Filter<EmissionScope1StationaryCombustionActivity>
  ): Promise<EmissionScope1StationaryCombustionActivity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-stationary-combustion-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.update'] })
  @response(200, {
    description: 'EmissionScope1StationaryCombustionActivityPATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1StationaryCombustionActivity, { partial: true }),
        },
      },
    })
    emissionScope1StationaryCombustionData: EmissionScope1StationaryCombustionActivity,
    @param.where(EmissionScope1StationaryCombustionActivity) where?: Where<EmissionScope1StationaryCombustionActivity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(emissionScope1StationaryCombustionData, where)
  }

  @get('/emission-scope1-stationary-combustion-activity/{id}')
  @response(200, {
    description: 'EmissionScope1StationaryCombustionActivity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1StationaryCombustionActivity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1StationaryCombustionActivity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1StationaryCombustionActivity>
  ): Promise<EmissionScope1StationaryCombustionActivity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-stationary-combustion-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.update'] })
  @response(204, {
    description: 'EmissionScope1StationaryCombustionActivityPATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1StationaryCombustionActivity, { partial: true }),
        },
      },
    })
    emissionScope1StationaryCombustionData: EmissionScope1StationaryCombustionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, emissionScope1StationaryCombustionData)
  }

  @put('/emission-scope1-stationary-combustion-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.update'] })
  @response(204, {
    description: 'EmissionScope1StationaryCombustionActivityPUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope1StationaryCombustionData: EmissionScope1StationaryCombustionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, emissionScope1StationaryCombustionData)
  }

  @del('/emission-scope1-stationary-combustion-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1StationaryCombustionActivityDELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-scope1-stationary-combustion-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1StationaryCombustionActivityPATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return await this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-scope1-stationary-combustion-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1StationaryCombustionActivityPATCH(soft-delete) success',
  })
  async softDeleteByYear(@param.path.number('year') year: number): Promise<any> {
    return await this.thisRepo.updateAll({ deletedId: +this.user[securityId], deletedAt: new Date() }, queryDataInYearOf(year))
  }

  @get('/emission-scope1-stationary-combustion-activity/optimize')
  @response(200, {
    description: 'Array of EmissionScope1StationaryCombustionActivity model instances with calculated EmissionFactor',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1StationaryCombustionActivity, { includeRelations: true }),
        },
      },
    },
  })
  async findOptimize(
    @param.query.number('stationaryCombustionId') stationaryCombustionId: number,
    @param.query.number('year') year: number,
    @param.query.number('month') month: number
  ): Promise<any[]> {
    return this.thisRepo.getOptimizedActivitiesAtYear({ stationaryCombustionId, year, month })
  }
}
