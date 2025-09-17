import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, Response, response, RestBindings } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1StationaryCombustion } from '../../models'
import { EmissionScope1StationaryCombustionRepository, UserGroupByMapRepository } from '../../repositories'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1StationaryCombustionController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1StationaryCombustionRepository) public thisRepo: EmissionScope1StationaryCombustionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope1-stationary-combustion')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.create'] })
  @response(200, {
    description: 'EmissionScope1StationaryCombustion model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1StationaryCombustion) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1StationaryCombustion, {
            title: 'NewEmissionScope1StationaryCombustion',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope1StationaryCombustion: Omit<EmissionScope1StationaryCombustion, 'id'>
  ): Promise<EmissionScope1StationaryCombustion> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope1StationaryCombustion.groupById])

    emissionScope1StationaryCombustion.createdId = +this.user[securityId]
    emissionScope1StationaryCombustion.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope1StationaryCombustion)
  }

  @get('/emission-scope1-stationary-combustion')
  @response(200, {
    description: 'Array of EmissionScope1StationaryCombustion model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1StationaryCombustion, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1StationaryCombustion) filter?: Filter<EmissionScope1StationaryCombustion>
  ): Promise<EmissionScope1StationaryCombustion[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-stationary-combustion')
  @response(200, {
    description: 'EmissionScope1StationaryCombustion PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1StationaryCombustion, { partial: true }),
        },
      },
    })
    emissionScope1StationaryCombustion: EmissionScope1StationaryCombustion,
    @param.where(EmissionScope1StationaryCombustion) where?: Where<EmissionScope1StationaryCombustion>
  ): Promise<Count> {
    emissionScope1StationaryCombustion.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope1StationaryCombustion, where)
  }

  @get('/emission-scope1-stationary-combustion/{id}')
  @response(200, {
    description: 'EmissionScope1StationaryCombustion model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1StationaryCombustion, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1StationaryCombustion, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1StationaryCombustion>
  ): Promise<EmissionScope1StationaryCombustion> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-stationary-combustion/{id}')
  @response(204, {
    description: 'EmissionScope1StationaryCombustion PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1StationaryCombustion, { partial: true }),
        },
      },
    })
    emissionScope1StationaryCombustion: EmissionScope1StationaryCombustion
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1StationaryCombustion.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope1StationaryCombustion)
  }

  @put('/emission-scope1-stationary-combustion/{id}')
  @response(204, {
    description: 'EmissionScope1StationaryCombustion PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope1StationaryCombustion: EmissionScope1StationaryCombustion
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1StationaryCombustion.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope1StationaryCombustion)
  }

  @del('/emission-scope1-stationary-combustion/{id}')
  @response(204, {
    description: 'EmissionScope1StationaryCombustion DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope1-stationary-combustion/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope1StationaryCombustion model instances' })
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

  @patch('/emission-scope1-stationary-combustion/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.stationary-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1StationaryCombustion PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }
}
