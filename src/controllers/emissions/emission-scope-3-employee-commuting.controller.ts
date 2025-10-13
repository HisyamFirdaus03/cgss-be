import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope3EmployeeCommuting } from '../../models'
import { EmissionScope3EmployeeCommutingRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, BeforeTransform, JwtStrategy, UserAccessLevel } from '../../common'
import { inject } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope3EmployeeCommutingController {
  constructor(
    @inject(SecurityBindings.USER, { optional: true }) private user: UserProfile,
    @repository(EmissionScope3EmployeeCommutingRepository)
    public thisRepo: EmissionScope3EmployeeCommutingRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope3-employee-commuting')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.create'] })
  @response(200, {
    description: 'EmissionScope3EmployeeCommuting model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope3EmployeeCommuting) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3EmployeeCommuting, {
            title: 'NewEmissionScope3EmployeeCommuting',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope3EmployeeCommuting: Omit<EmissionScope3EmployeeCommuting, 'id'>
  ): Promise<EmissionScope3EmployeeCommuting> {
    await this.userGroupByMapRepository.validateGroupByAccess([emissionScope3EmployeeCommuting.groupById])

    emissionScope3EmployeeCommuting.createdId = +this.user[securityId]
    emissionScope3EmployeeCommuting.updatedId = +this.user[securityId]
    return this.thisRepo.create(emissionScope3EmployeeCommuting)
  }

  @get('/emission-scope3-employee-commuting/count')
  @response(200, {
    description: 'EmissionScope3EmployeeCommuting model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(EmissionScope3EmployeeCommuting) where?: Where<EmissionScope3EmployeeCommuting>): Promise<Count> {
    return this.thisRepo.count(where)
  }

  @get('/emission-scope3-employee-commuting')
  @response(200, {
    description: 'Array of EmissionScope3EmployeeCommuting model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3EmployeeCommuting, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope3EmployeeCommuting) filter?: Filter<EmissionScope3EmployeeCommuting>
  ): Promise<EmissionScope3EmployeeCommuting[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope3-employee-commuting')
  @response(200, {
    description: 'EmissionScope3EmployeeCommuting PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3EmployeeCommuting, { partial: true }),
        },
      },
    })
    emissionScope3EmployeeCommuting: EmissionScope3EmployeeCommuting,
    @param.where(EmissionScope3EmployeeCommuting) where?: Where<EmissionScope3EmployeeCommuting>
  ): Promise<Count> {
    emissionScope3EmployeeCommuting.updatedId = +this.user[securityId]
    return this.thisRepo.updateAll(emissionScope3EmployeeCommuting, where)
  }

  @get('/emission-scope3-employee-commuting/{id}')
  @response(200, {
    description: 'EmissionScope3EmployeeCommuting model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope3EmployeeCommuting, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope3EmployeeCommuting, { exclude: 'where' }) filter?: FilterExcludingWhere<EmissionScope3EmployeeCommuting>
  ): Promise<EmissionScope3EmployeeCommuting> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope3-employee-commuting/{id}')
  @response(204, {
    description: 'EmissionScope3EmployeeCommuting PATCH success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.update'] })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3EmployeeCommuting, { partial: true }),
        },
      },
    })
    emissionScope3EmployeeCommuting: EmissionScope3EmployeeCommuting
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope3EmployeeCommuting.updatedId = +this.user[securityId]
    await this.thisRepo.updateById(id, emissionScope3EmployeeCommuting)
  }

  @put('/emission-scope3-employee-commuting/{id}')
  @response(204, {
    description: 'EmissionScope3EmployeeCommuting PUT success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.update'] })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope3EmployeeCommuting: EmissionScope3EmployeeCommuting
  ): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    emissionScope3EmployeeCommuting.updatedId = +this.user[securityId]
    await this.thisRepo.replaceById(id, emissionScope3EmployeeCommuting)
  }

  @del('/emission-scope3-employee-commuting/{id}')
  @response(204, {
    description: 'EmissionScope3EmployeeCommuting DELETE success',
  })
  @authorize({  voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.delete'] })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const models = await this.find({ where: { id }, fields: ['groupById', 'id'] })
    await this.userGroupByMapRepository.validateGroupByAccess(models.map((m) => m.groupById))

    await this.thisRepo.deleteById(id)
  }

  @get('/emission-scope3-employee-commuting/optimize')
  @response(200, { description: 'Array of Optimize EmissionScope3EmployeeCommuting model instances' })
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

  @patch('/emission-scope3-employee-commuting/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.delete'] })
  @response(204, {
    description: 'EmissionScope3EmployeeCommuting PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    return await this.thisRepo.softDeleteId(id)
  }

  // this also been used by cron job
  @authenticate.skip()
  @post('/emission-scope3-employee-commuting/push-activities')
  async pushEmployeeCommutingActivities(
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
    @requestBody()
    payload: { date: Date | undefined, groupByIds: number[] | undefined } | undefined
  ) {
    const _date = payload?.date ? new Date(payload?.date) : new Date()
    const _groupByIds = payload?.groupByIds ?? []

    return await this.thisRepo.pushEmployeeCommutingActivities(tenantId, { groupByIds: _groupByIds, date: _date })
  }
}
