import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { EmissionScope1MobileCombustionActivity, EmissionScope1StationaryCombustionActivity } from '../../models'
import { EmissionScope1MobileCombustionActivityRepository, EmissionScope1MobileCombustionRepository, UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { AuthzBindings, JwtStrategy, queryDataInYearOf } from '../../common'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { inject } from '@loopback/core'
import { format } from 'date-fns'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionScope1MobileCombustionActivityController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EmissionScope1MobileCombustionActivityRepository) public thisRepo: EmissionScope1MobileCombustionActivityRepository,
    @repository(EmissionScope1MobileCombustionRepository) public parentRepo: EmissionScope1MobileCombustionRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository,
  ) { }

  @post('/emission-scope1-mobile-combustion-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.create'] })
  @response(200, {
    description: 'EmissionScope1MobileCombustionActivity model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionScope1MobileCombustionActivity) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1MobileCombustionActivity, {
            title: 'NewEmissionScope1MobileCombustionData',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionScope1MobileCombustionData: Omit<EmissionScope1MobileCombustionActivity, 'id'>
  ): Promise<EmissionScope1MobileCombustionActivity> {
    const parentModels = await this.parentRepo.findById(emissionScope1MobileCombustionData.mobileCombustionId, {
      fields: ['id', 'groupById']
    });
    await this.userGroupByMapRepository.validateGroupByAccess([parentModels.groupById])

    return this.thisRepo.create(emissionScope1MobileCombustionData)
  }

  @get('/emission-scope1-mobile-combustion-activity')
  @response(200, {
    description: 'Array of EmissionScope1MobileCombustionActivity model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1MobileCombustionActivity, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(EmissionScope1MobileCombustionActivity) filter?: Filter<EmissionScope1MobileCombustionActivity>
  ): Promise<EmissionScope1MobileCombustionActivity[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/emission-scope1-mobile-combustion-activity')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.update'] })
  @response(200, {
    description: 'EmissionScope1MobileCombustionActivityPATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1MobileCombustionActivity, { partial: true }),
        },
      },
    })
    emissionScope1MobileCombustionData: EmissionScope1MobileCombustionActivity,
    @param.where(EmissionScope1MobileCombustionActivity) where?: Where<EmissionScope1MobileCombustionActivity>
  ): Promise<Count> {
    return this.thisRepo.updateAll(emissionScope1MobileCombustionData, where)
  }

  @get('/emission-scope1-mobile-combustion-activity/{id}')
  @response(200, {
    description: 'EmissionScope1MobileCombustionActivity model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionScope1MobileCombustionActivity, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionScope1MobileCombustionActivity, { exclude: 'where' })
    filter?: FilterExcludingWhere<EmissionScope1MobileCombustionActivity>
  ): Promise<EmissionScope1MobileCombustionActivity> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/emission-scope1-mobile-combustion-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.update'] })
  @response(204, {
    description: 'EmissionScope1MobileCombustionActivityPATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionScope1MobileCombustionActivity, { partial: true }),
        },
      },
    })
    emissionScope1MobileCombustionData: EmissionScope1MobileCombustionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.updateById(id, emissionScope1MobileCombustionData)
  }

  @put('/emission-scope1-mobile-combustion-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.update'] })
  @response(204, {
    description: 'EmissionScope1MobileCombustionActivityPUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() emissionScope1MobileCombustionData: EmissionScope1MobileCombustionActivity
  ): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.replaceById(id, emissionScope1MobileCombustionData)
  }

  @del('/emission-scope1-mobile-combustion-activity/{id}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1MobileCombustionActivityDELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    await this.thisRepo.deleteById(id)
  }

  @patch('/emission-scope1-mobile-combustion-activity/{id}/soft-delete')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1MobileCombustionActivityPATCH(soft-delete) success',
  })
  async softDeleteById(@param.path.number('id') id: number): Promise<void> {
    const model = await this.findById(id, {
      include: [{ relation: 'belongsTo', scope: { fields: ['id', 'groupById'] } }]
    })

    // @ts-ignore
    await this.userGroupByMapRepository.validateGroupByAccess([model.belongsTo.groupById])

    return this.thisRepo.softDeleteId(id)
  }

  @patch('/emission-scope1-mobile-combustion-activity/soft-delete-by-year/{year}')
  @authorize({ voters: [AuthzBindings.Usr.Permission], scopes: ['scope1.mobile-combustion.delete'] })
  @response(204, {
    description: 'EmissionScope1MobileCombustionActivityPATCH(soft-delete) success',
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

  @get('/emission-scope1-mobile-combustion-activity/optimize')
  @response(200, {
    description: 'Array of EmissionScope1MobileCombustionActivity model instances with calculated EmissionFactor',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionScope1StationaryCombustionActivity, { includeRelations: true }),
        },
      },
    },
  })
  async findOptimize(
    @param.query.number('mobileCombustionId') mobileCombustionId: number,
    @param.query.number('year') year: number,
    @param.query.number('month') month: number
  ): Promise<any> {
    return this.thisRepo.getOptimizedActivitiesAtYear({ mobileCombustionId, year, month })
  }
}
