import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope3WasteGeneratedActivity } from '../../models'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { inject } from '@loopback/core'
import { EmissionScope3WasteGeneratedActivityRepository, EmissionScope3WasteGeneratedRepository, UserGroupByMapRepository } from '../../repositories'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope3WasteGeneratedActivityController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope3WasteGeneratedActivityRepository) public thisRepo: EmissionScope3WasteGeneratedActivityRepository,
    @repository(EmissionScope3WasteGeneratedRepository) public parentRepo: EmissionScope3WasteGeneratedRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope-3-waste-generated-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.create'] })
  @response(200, {
    description: 'EmissionScope3WasteGeneratedActivity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope3WasteGeneratedActivity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3WasteGeneratedActivity, {
            title: 'NewEmissionScope3WasteGeneratedActivity',
            exclude: ['id'],
          }),
        },
      },
    })
    EmissionScope3WasteGeneratedActivity: Omit<EmissionScope3WasteGeneratedActivity, 'id'>
  ): Promise<EmissionScope3WasteGeneratedActivity> {
    const parentModels = await this.parentRepo.findById(EmissionScope3WasteGeneratedActivity.wasteGeneratedId, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(EmissionScope3WasteGeneratedActivity)
  }

  @get('/emission-scope-3-waste-generated-activity')
  @response(200, {
    description: 'Array of EmissionScope3WasteGeneratedActivity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3WasteGeneratedActivity, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(EmissionScope3WasteGeneratedActivity) filter?: Filter<EmissionScope3WasteGeneratedActivity>): Promise<EmissionScope3WasteGeneratedActivity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope-3-waste-generated-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.update'] })
  @response(200, {
    description: 'EmissionScope3WasteGeneratedActivity PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3WasteGeneratedActivity, { partial: true }),
        },
      },
    })
    EmissionScope3WasteGeneratedActivity: EmissionScope3WasteGeneratedActivity,
    @param.where(EmissionScope3WasteGeneratedActivity) where?: Where<EmissionScope3WasteGeneratedActivity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(EmissionScope3WasteGeneratedActivity, where)
  }

  @get('/emission-scope-3-waste-generated-activity/{id}')
  @response(200, {
    description: 'EmissionScope3WasteGeneratedActivity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope3WasteGeneratedActivity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope3WasteGeneratedActivity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope3WasteGeneratedActivity>
  ): Promise<EmissionScope3WasteGeneratedActivity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope-3-waste-generated-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.update'] })
  @response(204, {
    description: 'EmissionScope3WasteGeneratedActivity PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3WasteGeneratedActivity, { partial: true }),
        },
      },
    })
    EmissionScope3WasteGeneratedActivity: EmissionScope3WasteGeneratedActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, EmissionScope3WasteGeneratedActivity)
  }

  @put('/emission-scope-3-waste-generated-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.update'] })
  @response(204, {
    description: 'EmissionScope3WasteGeneratedActivity PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() EmissionScope3WasteGeneratedActivity: EmissionScope3WasteGeneratedActivity): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, EmissionScope3WasteGeneratedActivity)
  }

  @del('/emission-scope-3-waste-generated-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.delete'] })
  @response(204, {
    description: 'EmissionScope3WasteGeneratedActivity DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-scope-3-waste-generated-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.delete'] })
  @response(204, {
    description: 'EmissionScope3WasteGeneratedActivity PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return await this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-scope-3-waste-generated-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.delete'] })
  @response(204, {
    description: 'EmissionScope3WasteGeneratedActivity PATCH(soft-delete) success',
  })
  async softDeleteByYear(@param.path.number('year') year: number): Promise<any> {
    return await this.thisRepo.updateAll({ deletedId: +this.user[securityId], deletedAt: new Date() }, queryDataInYearOf(year))
  }

  @get('/emission-scope-3-waste-generated-activity/optimize')
  @response(200, {
    description: 'Array of EmissionScope3WasteGeneratedActivity model instances with calculated EmissionFactor',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3WasteGeneratedActivityRepository, { includeRelations: true }),
        },
      },
    },
  })
  async findOptimize(
    @param.query.number('wasteGeneratedId') wasteGeneratedId: number,
    @param.query.number('year') year: number,
    @param.query.number('month') month: number
  ): Promise<any[]> {
    return this.thisRepo.getOptimizedActivitiesAtYear({ wasteGeneratedId, year, month })
  }
}
