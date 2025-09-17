import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { EmissionProductionActivity } from '../../models'
import { EmissionProductionActivityRepository, EmissionProductionRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { inject } from '@loopback/core'
import { format } from 'date-fns'
import { authorize } from '@loopback/authorization'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionProductionActivityControllerController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionProductionActivityRepository) public thisRepo: EmissionProductionActivityRepository,
    @repository(EmissionProductionRepository) public parentRepo: EmissionProductionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-production-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production-activity.create'] })
  @response(200, {
    description: 'EmissionProductionActivity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionProductionActivity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionProductionActivity, {
            title: 'NewEmissionProductionActivity',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionProductionActivity: Omit<EmissionProductionActivity, 'id'>
  ): Promise<EmissionProductionActivity> {
    const parentModels = await this.parentRepo.findById(emissionProductionActivity.emissionProductionId, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(emissionProductionActivity)
  }

  @get('/emission-production-activity')
  @response(200, {
    description: 'Array of EmissionProductionActivity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionProductionActivity, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionProductionActivity) filter?: Filter<EmissionProductionActivity>
  ): Promise<EmissionProductionActivity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-production-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production-activity.update'] })
  @response(200, {
    description: 'EmissionProductionActivity PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionProductionActivity, { partial: true }),
        },
      },
    })
    emissionProductionActivity: EmissionProductionActivity,
    @param.where(EmissionProductionActivity) where?: Where<EmissionProductionActivity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(emissionProductionActivity, where)
  }

  @get('/emission-production-activity/{id}')
  @response(200, {
    description: 'EmissionProductionActivity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionProductionActivity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionProductionActivity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionProductionActivity>
  ): Promise<EmissionProductionActivity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-production-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production-activity.update'] })
  @response(204, {
    description: 'EmissionProductionActivity PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionProductionActivity, { partial: true }),
        },
      },
    })
    emissionProductionActivity: EmissionProductionActivity
  ): Promise<void> {
    const model = await this.thisRepo.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, emissionProductionActivity)
  }

  @put('/emission-production-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production-activity.update'] })
  @response(204, {
    description: 'EmissionProductionActivity PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionProductionActivity: EmissionProductionActivity
  ): Promise<void> {
    const model = await this.thisRepo.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, emissionProductionActivity)
  }

  @del('/emission-production-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production-activity.delete'] })
  @response(204, {
    description: 'EmissionProductionActivity DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.thisRepo.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-production-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production-activity.delete'] })
  @response(204, {
    description: 'EmissionProductionActivity PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.thisRepo.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return await this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-production-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production-activity.delete'] })
  @response(204, {
    description: 'EmissionProductionActivity PATCH(soft-delete) success',
  })
  async softDeleteByYear(@param.path.number('year') year: number): Promise<any> {
    const res = await this.thisRepo.updateAll(
      {
        deletedId: +this.user[securityId],
        deletedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      },
      queryDataInYearOf(year)
    )

    return res
  }
}
