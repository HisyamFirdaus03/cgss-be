import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1FugitiveEmission } from '../../models'
import { EmissionScope1FugitiveEmissionRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1FugitiveEmissionController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1FugitiveEmissionRepository) private thisRepo: EmissionScope1FugitiveEmissionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) {
  }

  @post('/emission-scope1-fugitive-emission')
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.create'] })
  @response(200, {
    description: 'EmissionScope1FugitiveEmission model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1FugitiveEmission) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1FugitiveEmission, {
            title: 'NewEmissionScope1FugitiveEmission',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope1FugitiveEmission: Omit<EmissionScope1FugitiveEmission, 'id'>,
  ): Promise<EmissionScope1FugitiveEmission> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope1FugitiveEmission.groupById])

    emissionScope1FugitiveEmission.createdId = +this.user[securityId]
    emissionScope1FugitiveEmission.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope1FugitiveEmission)
  }

  @get('/emission-scope1-fugitive-emission')
  @response(200, {
    description: 'Array of EmissionScope1FugitiveEmission model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1FugitiveEmission, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1FugitiveEmission) filter?: Filter<EmissionScope1FugitiveEmission>,
  ): Promise<EmissionScope1FugitiveEmission[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-fugitive-emission')
  @response(200, {
    description: 'EmissionScope1FugitiveEmission PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1FugitiveEmission, { partial: true }),
        },
      },
    })
    emissionScope1FugitiveEmission: EmissionScope1FugitiveEmission,
    @param.where(EmissionScope1FugitiveEmission) where?: Where<EmissionScope1FugitiveEmission>,
  ): Promise<Count> {
    emissionScope1FugitiveEmission.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope1FugitiveEmission, where)
  }

  @get('/emission-scope1-fugitive-emission/{id}')
  @response(200, {
    description: 'EmissionScope1FugitiveEmission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1FugitiveEmission, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1FugitiveEmission, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1FugitiveEmission>,
  ): Promise<EmissionScope1FugitiveEmission> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-fugitive-emission/{id}')
  @response(204, {
    description: 'EmissionScope1FugitiveEmission PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1FugitiveEmission, { partial: true }),
        },
      },
    })
    emissionScope1FugitiveEmission: EmissionScope1FugitiveEmission,
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1FugitiveEmission.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope1FugitiveEmission)
  }

  @put('/emission-scope1-fugitive-emission/{id}')
  @response(204, {
    description: 'EmissionScope1FugitiveEmission PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope1FugitiveEmission: EmissionScope1FugitiveEmission,
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope1FugitiveEmission.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope1FugitiveEmission)
  }

  @del('/emission-scope1-fugitive-emission/{id}')
  @response(204, {
    description: 'EmissionScope1FugitiveEmission DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope1-fugitive-emission/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope1FugitiveEmission model instances' })
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

  @patch('/emission-scope1-fugitive-emission/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.fugitive-emission.delete'] })
  @response(204, {
    description: 'EmissionScope1FugitiveEmission PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }
}
