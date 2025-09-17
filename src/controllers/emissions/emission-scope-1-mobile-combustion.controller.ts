import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1MobileCombustion } from '../../models'
import { EmissionScope1MobileCombustionRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1MobileCombustionController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1MobileCombustionRepository) public thisRepo: EmissionScope1MobileCombustionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope1-mobile-combustion')
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.create'] })
  @response(200, {
    description: 'EmissionScope1MobileCombustion model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1MobileCombustion) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1MobileCombustion, {
            title: 'NewEmissionScope1MobileCombustion',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope1MobileCombustion: Omit<EmissionScope1MobileCombustion, 'id'>
  ): Promise<EmissionScope1MobileCombustion> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope1MobileCombustion.groupById])

    emissionScope1MobileCombustion.createdId = +this.user[securityId]
    emissionScope1MobileCombustion.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope1MobileCombustion)
  }

  @get('/emission-scope1-mobile-combustion')
  @response(200, {
    description: 'Array of EmissionScope1MobileCombustion model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1MobileCombustion, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1MobileCombustion) filter?: Filter<EmissionScope1MobileCombustion>
  ): Promise<EmissionScope1MobileCombustion[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-mobile-combustion')
  @response(200, {
    description: 'EmissionScope1MobileCombustion PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1MobileCombustion, { partial: true }),
        },
      },
    })
    emissionScope1MobileCombustion: EmissionScope1MobileCombustion,
    @param.where(EmissionScope1MobileCombustion) where?: Where<EmissionScope1MobileCombustion>
  ): Promise<Count> {
    emissionScope1MobileCombustion.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope1MobileCombustion, where)
  }

  @get('/emission-scope1-mobile-combustion/{id}')
  @response(200, {
    description: 'EmissionScope1MobileCombustion model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1MobileCombustion, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1MobileCombustion, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1MobileCombustion>
  ): Promise<EmissionScope1MobileCombustion> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-mobile-combustion/{id}')
  @response(204, {
    description: 'EmissionScope1MobileCombustion PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1MobileCombustion, { partial: true }),
        },
      },
    })
    emissionScope1MobileCombustion: EmissionScope1MobileCombustion
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1MobileCombustion.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope1MobileCombustion)
  }

  @put('/emission-scope1-mobile-combustion/{id}')
  @response(204, {
    description: 'EmissionScope1MobileCombustion PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope1MobileCombustion: EmissionScope1MobileCombustion
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1MobileCombustion.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope1MobileCombustion)
  }

  @del('/emission-scope1-mobile-combustion/{id}')
  @response(204, {
    description: 'EmissionScope1MobileCombustion DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope1-mobile-combustion/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope1MobileCombustion model instances' })
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

  @patch('/emission-scope1-mobile-combustion/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1MobileCombustion PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }
}
