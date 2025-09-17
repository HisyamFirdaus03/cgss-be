import {
  Filter,
  repository,
} from '@loopback/repository'
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
} from '@loopback/rest'
import { Configuration } from '../models'
import { ConfigurationRepository } from '../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy } from '../common'

@authenticate(JwtStrategy.UserAccessToken)
export class ConfigurationController {
  constructor(
    @repository(ConfigurationRepository)
    public thisRepo: ConfigurationRepository,
  ) {
  }

  @post('/configuration')
  @response(200, {
    description: 'Setting model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Configuration) } },
  })
  async create(
    @requestBody()
    setting: Configuration,
  ): Promise<Configuration> {
    const res = await this.thisRepo.find()

    if (res.length === 0) {
      return this.thisRepo.create(setting)
    } else {
      const id = res[0].id
      await this.thisRepo.updateById(id, setting)
      return this.thisRepo.findById(id, { fields: ['defaultBaseline', 'activitiesStartFrom', 'optOutCalc'] })
    }
  }

  @get('/configuration')
  @response(200, {
    description: 'Setting model instances',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Configuration, { includeRelations: true }),
      },
    },
  })
  async find(
    @param.filter(Configuration) filter?: Filter<Configuration>,
  ): Promise<Configuration> {
    return this.thisRepo.findFirst(filter)
  }
}
