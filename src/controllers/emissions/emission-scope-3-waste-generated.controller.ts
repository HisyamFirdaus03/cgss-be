import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope3WasteGenerated } from '../../models'
import { EmissionScope3WasteGeneratedRepository, UserGroupByMapRepository } from '../../repositories'

import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope3WasteGeneratedController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope3WasteGeneratedRepository) public thisRepo: EmissionScope3WasteGeneratedRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope-3-waste-generated')
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.create'] })
  @response(200, {
    description: 'EmissionScope3WasteGenerated model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope3WasteGenerated) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3WasteGenerated, {
            title: 'NewEmissionScope3WasteGenerated',
            exclude: ['id'],
          }),
        },
      },
    })
    wasteGenerated: Omit<EmissionScope3WasteGenerated, 'id'>
  ): Promise<EmissionScope3WasteGenerated> {
    await this.userGroupByMapRepository.validateGroupByAccess([wasteGenerated.groupById])

    wasteGenerated.createdId = +this.user[securityId]
    wasteGenerated.updatedId = +this.user[securityId]
    return this.thisRepo.create(wasteGenerated)
  }

  @get('/emission-scope-3-waste-generated')
  @response(200, {
    description: 'Array of EmissionScope3WasteGenerated model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3WasteGenerated, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(EmissionScope3WasteGenerated) filter?: Filter<EmissionScope3WasteGenerated>): Promise<EmissionScope3WasteGenerated[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope-3-waste-generated')
  @response(200, {
    description: 'EmissionScope3WasteGenerated PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3WasteGenerated, { partial: true }),
        },
      },
    })
    wasteGenerated: EmissionScope3WasteGenerated,
    @param.where(EmissionScope3WasteGenerated) where?: Where<EmissionScope3WasteGenerated>
  ): Promise<Count> {
    wasteGenerated.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(wasteGenerated, where)
  }

  @get('/emission-scope-3-waste-generated/{id}')
  @response(200, {
    description: 'EmissionScope3WasteGenerated model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope3WasteGenerated, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope3WasteGenerated, { exclude: 'where' }) filter?: FilterExcludingWhere<EmissionScope3WasteGenerated>
  ): Promise<EmissionScope3WasteGenerated> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope-3-waste-generated/{id}')
  @response(204, {
    description: 'EmissionScope3WasteGenerated PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3WasteGenerated, { partial: true }),
        },
      },
    })
    wasteGenerated: EmissionScope3WasteGenerated
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    wasteGenerated.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, wasteGenerated)
  }

  @put('/emission-scope-3-waste-generated/{id}')
  @response(204, {
    description: 'EmissionScope3WasteGenerated PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.update'] })
  async replaceById(@param.path.number('id') id: number, @requestBody() wasteGenerated: EmissionScope3WasteGenerated): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    wasteGenerated.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, wasteGenerated)
  }

  @del('/emission-scope-3-waste-generated/{id}')
  @response(204, {
    description: 'EmissionScope3WasteGenerated DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope-3-waste-generated/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope3WasteGenerated model instances' })
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

  @patch('/emission-scope-3-waste-generated/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.waste-generated.delete'] })
  @response(204, {
    description: 'EmissionScope3WasteGenerated PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }
}
