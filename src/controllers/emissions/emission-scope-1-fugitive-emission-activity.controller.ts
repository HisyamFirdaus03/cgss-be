import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1FugitiveEmissionActivity } from '../../models'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { inject } from '@loopback/core'
import { format } from 'date-fns'
import { EmissionScope1FugitiveEmissionActivityRepository, EmissionScope1FugitiveEmissionRepository, UserGroupByMapRepository } from '../../repositories'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1FugitiveEmissionActivityControllerController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1FugitiveEmissionActivityRepository) public thisRepo: EmissionScope1FugitiveEmissionActivityRepository,
    @repository(EmissionScope1FugitiveEmissionRepository) public parentRepo: EmissionScope1FugitiveEmissionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope1-fugitive-emission-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.create'] })
  @response(200, {
    description: 'EmissionScope1FugitiveEmissionActivity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1FugitiveEmissionActivity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1FugitiveEmissionActivity, {
            title: 'NewEmissionScope1FugitiveEmissionActivity',
            exclude: ['id'],
          }),
        },
      },
    })
    EmissionScope1FugitiveEmissionActivity: Omit<EmissionScope1FugitiveEmissionActivity, 'id'>
  ): Promise<EmissionScope1FugitiveEmissionActivity> {
    const parentModels = await this.parentRepo.findById(EmissionScope1FugitiveEmissionActivity.fugitiveEmissionId, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(EmissionScope1FugitiveEmissionActivity)
  }

  @get('/emission-scope1-fugitive-emission-activity')
  @response(200, {
    description: 'Array of EmissionScope1FugitiveEmissionActivity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1FugitiveEmissionActivity, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1FugitiveEmissionActivity) filter?: Filter<EmissionScope1FugitiveEmissionActivity>
  ): Promise<EmissionScope1FugitiveEmissionActivity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-fugitive-emission-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.update'] })
  @response(200, {
    description: 'EmissionScope1FugitiveEmissionActivity PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1FugitiveEmissionActivity, { partial: true }),
        },
      },
    })
    EmissionScope1FugitiveEmissionActivity: EmissionScope1FugitiveEmissionActivity,
    @param.where(EmissionScope1FugitiveEmissionActivity) where?: Where<EmissionScope1FugitiveEmissionActivity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(EmissionScope1FugitiveEmissionActivity, where)
  }

  @get('/emission-scope1-fugitive-emission-activity/{id}')
  @response(200, {
    description: 'EmissionScope1FugitiveEmissionActivity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1FugitiveEmissionActivity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1FugitiveEmissionActivity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1FugitiveEmissionActivity>
  ): Promise<EmissionScope1FugitiveEmissionActivity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-fugitive-emission-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.update'] })
  @response(204, {
    description: 'EmissionScope1FugitiveEmissionActivity PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1FugitiveEmissionActivity, { partial: true }),
        },
      },
    })
    EmissionScope1FugitiveEmissionActivity: EmissionScope1FugitiveEmissionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, EmissionScope1FugitiveEmissionActivity)
  }

  @put('/emission-scope1-fugitive-emission-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.update'] })
  @response(204, {
    description: 'EmissionScope1FugitiveEmissionActivity PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() EmissionScope1FugitiveEmissionActivity: EmissionScope1FugitiveEmissionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, EmissionScope1FugitiveEmissionActivity)
  }

  @del('/emission-scope1-fugitive-emission-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1FugitiveEmissionActivity DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-scope1-fugitive-emission-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1FugitiveEmissionActivity PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return await this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-scope1-fugitive-emission-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1FugitiveEmissionActivity PATCH(soft-delete) success',
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
