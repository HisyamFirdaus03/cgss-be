import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope2 } from '../../models'
import { EmissionScope2Repository, UserGroupByMapRepository } from '../../repositories'

import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope2Controller {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope2Repository) public thisRepo: EmissionScope2Repository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope-2')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.create'] })
  @response(200, {
    description: 'EmissionScope2 model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope2) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope2, {
            title: 'NewEmissionScope2',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope2: Omit<EmissionScope2, 'id'>
  ): Promise<EmissionScope2> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope2.groupById])

    emissionScope2.createdId = +this.user[securityId]
    emissionScope2.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope2)
  }

  @get('/emission-scope-2')
  @response(200, {
    description: 'Array of EmissionScope2 model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope2, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(EmissionScope2) filter?: Filter<EmissionScope2>): Promise<EmissionScope2[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope-2')
  @response(200, {
    description: 'EmissionScope2 PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope2, { partial: true }),
        },
      },
    })
    emissionScope2: EmissionScope2,
    @param.where(EmissionScope2) where?: Where<EmissionScope2>
  ): Promise<Count> {
    emissionScope2.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope2, where)
  }

  @get('/emission-scope-2/{id}')
  @response(200, {
    description: 'EmissionScope2 model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope2, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope2, { exclude: 'where' }) filter?: FilterExcludingWhere<EmissionScope2>
  ): Promise<EmissionScope2> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope-2/{id}')
  @response(204, {
    description: 'EmissionScope2 PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope2, { partial: true }),
        },
      },
    })
    emissionScope2: EmissionScope2
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope2.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope2)
  }

  @put('/emission-scope-2/{id}')
  @response(204, {
    description: 'EmissionScope2 PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.update'] })
  async replaceById(@param.path.number('id') id: number, @requestBody() emissionScope2: EmissionScope2): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope2.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope2)
  }

  @del('/emission-scope-2/{id}')
  @response(204, {
    description: 'EmissionScope2 DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope-2/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope2 model instances' })
  async optimize(
    @param.query.number('pageIndex') pageIndex: number = 0,
    @param.query.number('pageSize') pageSize: number = 10,
    @param.query.string('q') q: string,
    @param.query.dateTime('from') from: Date,
    @param.query.dateTime('to') to: Date,
    @param.array('sorting', 'query', { type: 'object' }) sorting: BeforeTransform['sorting'],
    @param.array('groupByIds', 'query', { type: 'number' }) groupByIds: number[],
    @param.query.boolean('useDebug') useDebug: boolean = false,
    @param.header.string('x-tenant-id') tenantId: string = 'demo'
  ) {
    const db = `cgss_${tenantId}`
    return this.thisRepo.optimize({ db, dateRange: [from, to], useDebug, sorting, pageIndex, pageSize, q, groupByIds })
  }

  @patch('/emission-scope-2/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope2.scope2.delete'] })
  @response(204, {
    description: 'EmissionScope2 PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }
}
