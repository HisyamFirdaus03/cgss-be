import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionProduction } from '../../models'
import { EmissionProductionRepository, UserGroupByMapRepository } from '../../repositories'

import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionProductionController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionProductionRepository) public thisRepo: EmissionProductionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) {
  }

  @post('/emission-production')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production.create'] })
  @response(200, {
    description: 'EmissionProduction model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionProduction) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionProduction, {
            title: 'NewEmissionProduction',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionProduction: Omit<EmissionProduction, 'id'>,
  ): Promise<EmissionProduction> {
    const currentUserId = +this.user[securityId]

    await this.userGroupByMapRepository.validateGroupByAccess([emissionProduction.groupById])

    emissionProduction.createdId = currentUserId
    emissionProduction.updatedId = currentUserId
    return this.thisRepo.create(emissionProduction)
  }

  @get('/emission-production')
  @response(200, {
    description: 'Array of EmissionProduction model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionProduction, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionProduction) filter?: Filter<EmissionProduction>,
  ): Promise<EmissionProduction[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-production')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production.update'] })
  @response(200, {
    description: 'EmissionProduction PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionProduction, { partial: true }),
        },
      },
    })
    emissionProduction: EmissionProduction,
    @param.where(EmissionProduction) where?: Where<EmissionProduction>,
  ): Promise<Count> {
    emissionProduction.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionProduction, where)
  }

  @get('/emission-production/{id}')
  @response(200, {
    description: 'EmissionProduction model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionProduction, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionProduction, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionProduction>,
  ): Promise<EmissionProduction> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-production/{id}')
  @response(204, {
    description: 'EmissionProduction PATCH success',
  })
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionProduction, { partial: true }),
        },
      },
    })
    emissionProduction: EmissionProduction,
  ): Promise<void> {
    const models = await this.thisRepo.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionProduction.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionProduction)
  }

  @put('/emission-production/{id}')
  @response(204, {
    description: 'EmissionProduction PUT success',
  })
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionProduction: EmissionProduction,
  ): Promise<void> {
    const models = await this.thisRepo.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionProduction.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionProduction)
  }

  @del('/emission-production/{id}')
  @response(204, {
    description: 'EmissionProduction DELETE success',
  })
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-production/optimize')
  @response(200, { description: 'Array of Optimize EmissionProduction model instances' })
  async optimize(
    @param.query.number('pageIndex') pageIndex: number = 0,
    @param.query.number('pageSize') pageSize: number = 10,
    @param.query.string('q') q: string,
    @param.query.dateTime('from') from: Date,
    @param.query.dateTime('to') to: Date,
    @param.array('sorting', 'query', { type: 'object' }) sorting: BeforeTransform['sorting'],
    @param.array('groupByIds', 'query', { type: 'number' }) groupByIds: number[],
    @param.query.boolean('useDebug') useDebug: boolean = false,
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
  ) {
    const db = `cgss_${tenantId}`
    return this.thisRepo.optimize({ db, dateRange: [from, to], useDebug, sorting, pageIndex, pageSize, q, groupByIds })
  }

  @patch('/emission-production/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['emission-production.delete'] })
  @response(204, {
    description: 'EmissionProduction PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }
}
