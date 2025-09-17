import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope3UpstreamDownstreamTransportationAndDistribution } from '../../models'
import { EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope3UpstreamDownstreamTransportationAndDistributionController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository)
    public thisRepo: EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope3-upstream-downstream-transportation-and-distribution')
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.upstream-downstream-transportation-and-distribution.create'] })
  @response(200, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope3UpstreamDownstreamTransportationAndDistribution) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3UpstreamDownstreamTransportationAndDistribution, {
            title: 'NewEmissionScope3UpstreamDownstreamTransportationAndDistribution',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope3UpstreamDownstreamTransportationAndDistribution: Omit<EmissionScope3UpstreamDownstreamTransportationAndDistribution, 'id'>
  ): Promise<EmissionScope3UpstreamDownstreamTransportationAndDistribution> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope3UpstreamDownstreamTransportationAndDistribution.groupById])

    emissionScope3UpstreamDownstreamTransportationAndDistribution.createdId = +this.user[securityId]
    emissionScope3UpstreamDownstreamTransportationAndDistribution.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope3UpstreamDownstreamTransportationAndDistribution)
  }

  @get('/emission-scope3-upstream-downstream-transportation-and-distribution/count')
  @response(200, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(EmissionScope3UpstreamDownstreamTransportationAndDistribution)
    where?: Where<EmissionScope3UpstreamDownstreamTransportationAndDistribution>
  ): Promise<Count> {
    return this.thisRepo.count(where)
  }

  @get('/emission-scope3-upstream-downstream-transportation-and-distribution')
  @response(200, {
    description: 'Array of EmissionScope3UpstreamDownstreamTransportationAndDistribution model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3UpstreamDownstreamTransportationAndDistribution, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope3UpstreamDownstreamTransportationAndDistribution)
    filter?: Filter<EmissionScope3UpstreamDownstreamTransportationAndDistribution>
  ): Promise<EmissionScope3UpstreamDownstreamTransportationAndDistribution[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope3-upstream-downstream-transportation-and-distribution')
  @response(200, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3UpstreamDownstreamTransportationAndDistribution, { partial: true }),
        },
      },
    })
    emissionScope3UpstreamDownstreamTransportationAndDistribution: EmissionScope3UpstreamDownstreamTransportationAndDistribution,
    @param.where(EmissionScope3UpstreamDownstreamTransportationAndDistribution)
    where?: Where<EmissionScope3UpstreamDownstreamTransportationAndDistribution>
  ): Promise<Count> {
    emissionScope3UpstreamDownstreamTransportationAndDistribution.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope3UpstreamDownstreamTransportationAndDistribution, where)
  }

  @get('/emission-scope3-upstream-downstream-transportation-and-distribution/{id}')
  @response(200, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope3UpstreamDownstreamTransportationAndDistribution, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope3UpstreamDownstreamTransportationAndDistribution, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope3UpstreamDownstreamTransportationAndDistribution>
  ): Promise<EmissionScope3UpstreamDownstreamTransportationAndDistribution> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope3-upstream-downstream-transportation-and-distribution/{id}')
  @response(204, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.upstream-downstream-transportation-and-distribution.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3UpstreamDownstreamTransportationAndDistribution, { partial: true }),
        },
      },
    })
    emissionScope3UpstreamDownstreamTransportationAndDistribution: EmissionScope3UpstreamDownstreamTransportationAndDistribution
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope3UpstreamDownstreamTransportationAndDistribution.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope3UpstreamDownstreamTransportationAndDistribution)
  }

  @put('/emission-scope3-upstream-downstream-transportation-and-distribution/{id}')
  @response(204, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.upstream-downstream-transportation-and-distribution.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody()
    emissionScope3UpstreamDownstreamTransportationAndDistribution: EmissionScope3UpstreamDownstreamTransportationAndDistribution
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope3UpstreamDownstreamTransportationAndDistribution.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope3UpstreamDownstreamTransportationAndDistribution)
  }

  @del('/emission-scope3-upstream-downstream-transportation-and-distribution/{id}')
  @response(204, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.upstream-downstream-transportation-and-distribution.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope3-upstream-downstream-transportation-and-distribution/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope3UpstreamDownstreamTransportationAndDistribution model instances' })
  async optimize(
    @param.query.string('type') type: 'upstream' | 'downstream',
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
    return this.thisRepo.optimize({ db, dateRange: [from, to], useDebug, type, sorting, pageIndex, pageSize, q, groupByIds })
  }

  @patch('/emission-scope3-upstream-downstream-transportation-and-distribution/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.upstream-downstream-transportation-and-distribution.delete'] })
  @response(204, {
    description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }

  // @post('/emission-scope3-upstream-downstream-transportation-and-distribution/optimize')
  // @response(200, { description: 'EmissionScope3UpstreamDownstreamTransportationAndDistribution model instance' })
  // async optimizePost(
  //   @requestBody()
  //   payload: EmissionScope3UpstreamDownstreamTransportationAndDistribution & {
  //     travelers: EmissionScope3UpstreamDownstreamTransportationAndDistributionActivity[]
  //   }
  // ): Promise<void> {
  //   return this.thisRepo.optimizePost(payload)
  // }
}
