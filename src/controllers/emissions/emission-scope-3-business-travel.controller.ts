import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope3BusinessTravel, EmissionScope3BusinessTravelActivity } from '../../models'
import { EmissionScope3BusinessTravelRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope3BusinessTravelController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope3BusinessTravelRepository)
    public thisRepo: EmissionScope3BusinessTravelRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope3-business-travel')
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.business-travel.create'] })
  @response(200, {
    description: 'EmissionScope3BusinessTravel model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope3BusinessTravel) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3BusinessTravel, {
            title: 'NewEmissionScope3BusinessTravel',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope3BusinessTravel: Omit<EmissionScope3BusinessTravel, 'id'>
  ): Promise<EmissionScope3BusinessTravel> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope3BusinessTravel.groupById])

    emissionScope3BusinessTravel.createdId = +this.user[securityId]
    emissionScope3BusinessTravel.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope3BusinessTravel)
  }

  @get('/emission-scope3-business-travel/count')
  @response(200, {
    description: 'EmissionScope3BusinessTravel model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(EmissionScope3BusinessTravel) where?: Where<EmissionScope3BusinessTravel>): Promise<Count> {
    return this.thisRepo.count(where)
  }

  @get('/emission-scope3-business-travel')
  @response(200, {
    description: 'Array of EmissionScope3BusinessTravel model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3BusinessTravel, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope3BusinessTravel) filter?: Filter<EmissionScope3BusinessTravel>
  ): Promise<EmissionScope3BusinessTravel[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope3-business-travel')
  @response(200, {
    description: 'EmissionScope3BusinessTravel PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3BusinessTravel, { partial: true }),
        },
      },
    })
    emissionScope3BusinessTravel: EmissionScope3BusinessTravel,
    @param.where(EmissionScope3BusinessTravel) where?: Where<EmissionScope3BusinessTravel>
  ): Promise<Count> {
    emissionScope3BusinessTravel.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope3BusinessTravel, where)
  }

  @get('/emission-scope3-business-travel/{id}')
  @response(200, {
    description: 'EmissionScope3BusinessTravel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope3BusinessTravel, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope3BusinessTravel, { exclude: 'where' }) filter?: FilterExcludingWhere<EmissionScope3BusinessTravel>
  ): Promise<EmissionScope3BusinessTravel> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope3-business-travel/{id}')
  @response(204, {
    description: 'EmissionScope3BusinessTravel PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.business-travel.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3BusinessTravel, { partial: true }),
        },
      },
    })
    emissionScope3BusinessTravel: EmissionScope3BusinessTravel
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope3BusinessTravel.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope3BusinessTravel)
  }

  @put('/emission-scope3-business-travel/{id}')
  @response(204, {
    description: 'EmissionScope3BusinessTravel PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.business-travel.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope3BusinessTravel: EmissionScope3BusinessTravel
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope3BusinessTravel.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope3BusinessTravel)
  }

  @del('/emission-scope3-business-travel/{id}')
  @response(204, {
    description: 'EmissionScope3BusinessTravel DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.business-travel.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope3-business-travel/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope3BusinessTravel model instances' })
  async optimize(
    @param.query.boolean('useDebug') useDebug: boolean = false,
    @param.array('sorting', 'query', { type: 'object' }) sorting: BeforeTransform['sorting'],
    @param.array('groupByIds', 'query', { type: 'number' }) groupByIds: number[],
    @param.query.number('pageIndex') pageIndex: number = 0,
    @param.query.number('pageSize') pageSize: number = 10,
    @param.query.string('q') q: string,
    @param.query.dateTime('from') from: Date,
    @param.query.dateTime('to') to: Date,
    @param.header.string('x-tenant-id') tenantId: string = 'demo'
  ) {
    const db = `cgss_${tenantId}`
    return this.thisRepo.optimize({ db, dateRange: [from, to], useDebug, sorting, pageIndex, pageSize, q, groupByIds })
  }

  @patch('/emission-scope3-business-travel/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.business-travel.delete'] })
  @response(204, {
    description: 'EmissionScope3BusinessTravel PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }

  @post('/emission-scope3-business-travel/optimize')
  @response(200, { description: 'EmissionScope3BusinessTravel model instance' })
  async optimizePost(
    @requestBody() payload: EmissionScope3BusinessTravel & { travelers: EmissionScope3BusinessTravelActivity[] }
  ): Promise<void> {
    return this.thisRepo.optimizePost(payload)
  }
}
