import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1ProcessEmission } from '../../models'
import { EmissionScope1ProcessEmissionRepository, UserGroupByMapRepository } from '../../repositories'

import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1ProcessEmissionController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1ProcessEmissionRepository) public thisRepo: EmissionScope1ProcessEmissionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope1-process-emission')
  @authorize({

    voters: [AuthzBindings.Usr.Permission],
    scopes: ['scope1.processes-emission.create']
  })
  @response(200, {
    description: 'EmissionScope1ProcessEmission model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1ProcessEmission) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1ProcessEmission, {
            title: 'NewEmissionScope1ProcessEmission',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope1ProcessEmission: Omit<EmissionScope1ProcessEmission, 'id'>
  ): Promise<EmissionScope1ProcessEmission> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope1ProcessEmission.groupById])

    emissionScope1ProcessEmission.createdId = +this.user[securityId]
    emissionScope1ProcessEmission.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope1ProcessEmission)
  }

  @get('/emission-scope1-process-emission')
  @response(200, {
    description: 'Array of EmissionScope1ProcessEmission model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1ProcessEmission, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1ProcessEmission) filter?: Filter<EmissionScope1ProcessEmission>
  ): Promise<EmissionScope1ProcessEmission[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-process-emission')
  @response(200, {
    description: 'EmissionScope1ProcessEmission PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1ProcessEmission, { partial: true }),
        },
      },
    })
    emissionScope1ProcessEmission: EmissionScope1ProcessEmission,
    @param.where(EmissionScope1ProcessEmission) where?: Where<EmissionScope1ProcessEmission>
  ): Promise<Count> {
    emissionScope1ProcessEmission.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope1ProcessEmission, where)
  }

  @get('/emission-scope1-process-emission/{id}')
  @response(200, {
    description: 'EmissionScope1ProcessEmission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1ProcessEmission, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1ProcessEmission, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1ProcessEmission>
  ): Promise<EmissionScope1ProcessEmission> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-process-emission/{id}')
  @response(204, {
    description: 'EmissionScope1ProcessEmission PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1ProcessEmission, { partial: true }),
        },
      },
    })
    emissionScope1ProcessEmission: EmissionScope1ProcessEmission
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1ProcessEmission.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope1ProcessEmission)
  }

  @put('/emission-scope1-process-emission/{id}')
  @response(204, {
    description: 'EmissionScope1ProcessEmission PUT success',
  })
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope1ProcessEmission: EmissionScope1ProcessEmission
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1ProcessEmission.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope1ProcessEmission)
  }

  @del('/emission-scope1-process-emission/{id}')
  @response(204, {
    description: 'EmissionScope1ProcessEmission DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope1-process-emission/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope1ProcessEmission model instances' })
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

  @patch('/emission-scope1-process-emission/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.processes-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1ProcessEmission PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }
}
