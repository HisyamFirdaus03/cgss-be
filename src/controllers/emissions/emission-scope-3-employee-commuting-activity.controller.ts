import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope3EmployeeCommutingActivity } from '../../models'
import { EmissionScope3EmployeeCommutingActivityRepository, EmissionScope3EmployeeCommutingRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { format } from 'date-fns'
import { inject } from '@loopback/core'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope3EmployeeCommutingActivityController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope3EmployeeCommutingActivityRepository)
    public thisRepo: EmissionScope3EmployeeCommutingActivityRepository,
    @repository(EmissionScope3EmployeeCommutingRepository) public parentRepo: EmissionScope3EmployeeCommutingRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope3-employee-commuting-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.create'] })
  @response(200, {
    description: 'EmissionScope3EmployeeCommutingActivity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope3EmployeeCommutingActivity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3EmployeeCommutingActivity, {
            title: 'NewEmissionScope3EmployeeCommutingActivity',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope3EmployeeCommutingActivity: Omit<EmissionScope3EmployeeCommutingActivity, 'id'>
  ): Promise<EmissionScope3EmployeeCommutingActivity> {
    const parentModels = await this.parentRepo.findById(emissionScope3EmployeeCommutingActivity.employeeCommutingId, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(emissionScope3EmployeeCommutingActivity)
  }

  @get('/emission-scope3-employee-commuting-activity/count')
  @response(200, {
    description: 'EmissionScope3EmployeeCommutingActivity model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(EmissionScope3EmployeeCommutingActivity) where?: Where<EmissionScope3EmployeeCommutingActivity>
  ): Promise<Count> {
    return this.thisRepo.count(where)
  }

  @get('/emission-scope3-employee-commuting-activity')
  @response(200, {
    description: 'Array of EmissionScope3EmployeeCommutingActivity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3EmployeeCommutingActivity, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope3EmployeeCommutingActivity) filter?: Filter<EmissionScope3EmployeeCommutingActivity>
  ): Promise<EmissionScope3EmployeeCommutingActivity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope3-employee-commuting-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.update'] })
  @response(200, {
    description: 'EmissionScope3EmployeeCommutingActivity PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3EmployeeCommutingActivity, { partial: true }),
        },
      },
    })
    emissionScope3EmployeeCommutingActivity: EmissionScope3EmployeeCommutingActivity,
    @param.where(EmissionScope3EmployeeCommutingActivity) where?: Where<EmissionScope3EmployeeCommutingActivity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(emissionScope3EmployeeCommutingActivity, where)
  }

  @get('/emission-scope3-employee-commuting-activity/{id}')
  @response(200, {
    description: 'EmissionScope3EmployeeCommutingActivity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope3EmployeeCommutingActivity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope3EmployeeCommutingActivity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope3EmployeeCommutingActivity>
  ): Promise<EmissionScope3EmployeeCommutingActivity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope3-employee-commuting-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.update'] })
  @response(204, {
    description: 'EmissionScope3EmployeeCommutingActivity PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope3EmployeeCommutingActivity, { partial: true }),
        },
      },
    })
    emissionScope3EmployeeCommutingActivity: EmissionScope3EmployeeCommutingActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, emissionScope3EmployeeCommutingActivity)
  }

  @put('/emission-scope3-employee-commuting-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.update'] })
  @response(204, {
    description: 'EmissionScope3EmployeeCommutingActivity PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope3EmployeeCommutingActivity: EmissionScope3EmployeeCommutingActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, emissionScope3EmployeeCommutingActivity)
  }

  @del('/emission-scope3-employee-commuting-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.delete'] })
  @response(204, {
    description: 'EmissionScope3EmployeeCommutingActivity DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-scope3-employee-commuting-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.delete'] })
  @response(204, {
    description: 'EmissionScope3EmployeeCommutingActivity PATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-scope3-employee-commuting-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope3.employee-commuting.delete'] })
  @response(204, {
    description: 'EmissionScope3EmployeeCommutingActivity PATCH(soft-delete) success',
  })
  async softDeleteByYear(@param.path.number('year') year: number): Promise<any> {
    const res = await this.thisRepo.updateAll(
      {
        deletedId: +this.user[securityId],
        deletedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      },
      queryDataInYearOf(year)
    )

    return res
  }

  @get('/emission-scope3-employee-commuting-activity/optimize')
  @response(200, {
    description: 'Array of EmissionScope3EmployeeCommutingActivity model instances with calculated EmissionFactor',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope3EmployeeCommutingActivityRepository, { includeRelations: true }),
        },
      },
    },
  })
  async findOptimize(
    @param.query.number('employeeCommutingId') employeeCommutingId: number,
    @param.query.number('year') year: number,
    @param.query.number('month') month: number
  ): Promise<any> {
    return this.thisRepo.getOptimizedActivitiesAtYear({ employeeCommutingId, year, month })
  }
}
