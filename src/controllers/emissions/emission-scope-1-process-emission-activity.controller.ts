import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1ProcessEmissionActivity } from '../../models'
import { EmissionScope1ProcessEmissionActivityRepository, EmissionScope1ProcessEmissionRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { inject } from '@loopback/core'
import { format } from 'date-fns'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1ProcessEmissionActivityControllerController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1ProcessEmissionActivityRepository) public thisRepo: EmissionScope1ProcessEmissionActivityRepository,
    @repository(EmissionScope1ProcessEmissionRepository) public parentRepo: EmissionScope1ProcessEmissionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope1-process-emission-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.create'] })
  @response(200, {
    description: 'EmissionScope1ProcessEmissionActivity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1ProcessEmissionActivity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1ProcessEmissionActivity, {
            title: 'NewEmissionScope1ProcessEmissionActivity',
            exclude: ['id'],
          }),
        },
      },
    })
    EmissionScope1ProcessEmissionActivity: Omit<EmissionScope1ProcessEmissionActivity, 'id'>
  ): Promise<EmissionScope1ProcessEmissionActivity> {
    const parentModels = await this.parentRepo.findById(EmissionScope1ProcessEmissionActivity.processEmissionId, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(EmissionScope1ProcessEmissionActivity)
  }

  @get('/emission-scope1-process-emission-activity')
  @response(200, {
    description: 'Array of EmissionScope1ProcessEmissionActivity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1ProcessEmissionActivity, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1ProcessEmissionActivity) filter?: Filter<EmissionScope1ProcessEmissionActivity>
  ): Promise<EmissionScope1ProcessEmissionActivity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-process-emission-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.update'] })
  @response(200, {
    description: 'EmissionScope1ProcessEmissionActivity PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1ProcessEmissionActivity, { partial: true }),
        },
      },
    })
    EmissionScope1ProcessEmissionActivity: EmissionScope1ProcessEmissionActivity,
    @param.where(EmissionScope1ProcessEmissionActivity) where?: Where<EmissionScope1ProcessEmissionActivity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(EmissionScope1ProcessEmissionActivity, where)
  }

  @get('/emission-scope1-process-emission-activity/{id}')
  @response(200, {
    description: 'EmissionScope1ProcessEmissionActivity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1ProcessEmissionActivity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1ProcessEmissionActivity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1ProcessEmissionActivity>
  ): Promise<EmissionScope1ProcessEmissionActivity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-process-emission-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.update'] })
  @response(204, {
    description: 'EmissionScope1ProcessEmissionActivity PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1ProcessEmissionActivity, { partial: true }),
        },
      },
    })
    EmissionScope1ProcessEmissionActivity: EmissionScope1ProcessEmissionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, EmissionScope1ProcessEmissionActivity)
  }

  @put('/emission-scope1-process-emission-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.update'] })
  @response(204, {
    description: 'EmissionScope1ProcessEmissionActivity PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() EmissionScope1ProcessEmissionActivity: EmissionScope1ProcessEmissionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, EmissionScope1ProcessEmissionActivity)
  }

  @del('/emission-scope1-process-emission-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1ProcessEmissionActivity DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-scope1-process-emission-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1ProcessEmissionActivity PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return await this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-scope1-process-emission-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1ProcessEmissionActivity PATCH(soft-delete) success',
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
