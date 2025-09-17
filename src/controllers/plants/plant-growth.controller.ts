import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { PlantGrowthRate } from '../../models'
import { PlantGrowthRateRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class PlantGrowthController {
  constructor(
    @repository(PlantGrowthRateRepository)
    public plantGrowthRateRepository: PlantGrowthRateRepository
  ) {}

  @post('/plant-growth-rates')
  @response(200, {
    description: 'PlantGrowthRate model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantGrowthRate) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantGrowthRate, {
            title: 'NewPlantGrowthRate',
            exclude: ['id'],
          }),
        },
      },
    })
    plantGrowthRate: Omit<PlantGrowthRate, 'id'>
  ): Promise<PlantGrowthRate> {
    return this.plantGrowthRateRepository.create(plantGrowthRate)
  }

  @get('/plant-growth-rates')
  @response(200, {
    description: 'Array of PlantGrowthRate model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PlantGrowthRate, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(PlantGrowthRate) filter?: Filter<PlantGrowthRate>): Promise<PlantGrowthRate[]> {
    return this.plantGrowthRateRepository.find(filter)
  }

  @patch('/plant-growth-rates')
  @response(200, {
    description: 'PlantGrowthRate PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantGrowthRate, { partial: true }),
        },
      },
    })
    plantGrowthRate: PlantGrowthRate,
    @param.where(PlantGrowthRate) where?: Where<PlantGrowthRate>
  ): Promise<Count> {
    return this.plantGrowthRateRepository.updateAll(plantGrowthRate, where)
  }

  @get('/plant-growth-rates/{id}')
  @response(200, {
    description: 'PlantGrowthRate model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PlantGrowthRate, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PlantGrowthRate, { exclude: 'where' }) filter?: FilterExcludingWhere<PlantGrowthRate>
  ): Promise<PlantGrowthRate> {
    return this.plantGrowthRateRepository.findById(id, filter)
  }

  @patch('/plant-growth-rates/{id}')
  @response(204, {
    description: 'PlantGrowthRate PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantGrowthRate, { partial: true }),
        },
      },
    })
    plantGrowthRate: PlantGrowthRate
  ): Promise<void> {
    await this.plantGrowthRateRepository.updateById(id, plantGrowthRate)
  }

  @put('/plant-growth-rates/{id}')
  @response(204, {
    description: 'PlantGrowthRate PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plantGrowthRate: PlantGrowthRate): Promise<void> {
    await this.plantGrowthRateRepository.replaceById(id, plantGrowthRate)
  }

  @del('/plant-growth-rates/{id}')
  @response(204, {
    description: 'PlantGrowthRate DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantGrowthRateRepository.deleteById(id)
  }
}
