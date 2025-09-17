import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope2Activity } from '../../models'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { inject } from '@loopback/core'
import { EmissionScope2ActivityRepository, EmissionScope2Repository, UserGroupByMapRepository } from '../../repositories'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope2ActivityController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope2ActivityRepository) public thisRepo: EmissionScope2ActivityRepository,
    @repository(EmissionScope2Repository) public parentRepo: EmissionScope2Repository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope-2-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.create'] })
  @response(200, {
    description: 'EmissionScope2Activity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope2Activity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope2Activity, {
            title: 'NewEmissionScope2Activity',
            exclude: ['id'],
          }),
        },
      },
    })
    EmissionScope2Activity: Omit<EmissionScope2Activity, 'id'>
  ): Promise<EmissionScope2Activity> {
    const parentModels = await this.parentRepo.findById(EmissionScope2Activity.scope2Id, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(EmissionScope2Activity)
  }

  @get('/emission-scope-2-activity')
  @response(200, {
    description: 'Array of EmissionScope2Activity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope2Activity, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(EmissionScope2Activity) filter?: Filter<EmissionScope2Activity>): Promise<EmissionScope2Activity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope-2-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.update'] })
  @response(200, {
    description: 'EmissionScope2Activity PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope2Activity, { partial: true }),
        },
      },
    })
    EmissionScope2Activity: EmissionScope2Activity,
    @param.where(EmissionScope2Activity) where?: Where<EmissionScope2Activity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(EmissionScope2Activity, where)
  }

  @get('/emission-scope-2-activity/{id}')
  @response(200, {
    description: 'EmissionScope2Activity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope2Activity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope2Activity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope2Activity>
  ): Promise<EmissionScope2Activity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope-2-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.update'] })
  @response(204, {
    description: 'EmissionScope2Activity PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope2Activity, { partial: true }),
        },
      },
    })
    EmissionScope2Activity: EmissionScope2Activity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, EmissionScope2Activity)
  }

  @put('/emission-scope-2-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.update'] })
  @response(204, {
    description: 'EmissionScope2Activity PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() EmissionScope2Activity: EmissionScope2Activity): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, EmissionScope2Activity)
  }

  @del('/emission-scope-2-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.delete'] })
  @response(204, {
    description: 'EmissionScope2Activity DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-scope-2-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.delete'] })
  @response(204, {
    description: 'EmissionScope2Activity PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return await this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-scope-2-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.delete'] })
  @response(204, {
    description: 'EmissionScope2Activity PATCH(soft-delete) success',
  })
  async softDeleteByYear(@param.path.number('year') year: number): Promise<any> {
    return await this.thisRepo.updateAll({ deletedId: +this.user[securityId], deletedAt: new Date() }, queryDataInYearOf(year))
  }

  @get('/emission-scope-2-activity/optimize')
  @response(200, {
    description: 'Array of EmissionScope2Activity model instances with calculated EmissionFactor',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope2ActivityRepository, { includeRelations: true }),
        },
      },
    },
  })
  async findOptimize(
    @param.query.number('scope2Id') scope2Id: number,
    @param.query.number('year') year: number,
    @param.query.number('month') month: number
  ): Promise<any[]> {
    return this.thisRepo.getOptimizedActivitiesAtYear({ scope2Id, year, month })
  }
}
