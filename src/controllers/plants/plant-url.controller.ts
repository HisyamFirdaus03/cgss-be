import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { PlantUrl } from '../../models'
import { PlantUrlRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class PlantUrlController {
  constructor(
    @repository(PlantUrlRepository)
    public plantUrlRepository: PlantUrlRepository
  ) {}

  @post('/plant-urls')
  @response(200, {
    description: 'PlantUrl model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantUrl) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantUrl, {
            title: 'NewPlantUrl',
            exclude: ['id'],
          }),
        },
      },
    })
    plantUrl: Omit<PlantUrl, 'id'>
  ): Promise<PlantUrl> {
    return this.plantUrlRepository.create(plantUrl)
  }

  @get('/plant-urls')
  @response(200, {
    description: 'Array of PlantUrl model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PlantUrl, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(PlantUrl) filter?: Filter<PlantUrl>): Promise<PlantUrl[]> {
    return this.plantUrlRepository.find(filter)
  }

  @patch('/plant-urls')
  @response(200, {
    description: 'PlantUrl PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantUrl, { partial: true }),
        },
      },
    })
    plantUrl: PlantUrl,
    @param.where(PlantUrl) where?: Where<PlantUrl>
  ): Promise<Count> {
    return this.plantUrlRepository.updateAll(plantUrl, where)
  }

  @get('/plant-urls/{id}')
  @response(200, {
    description: 'PlantUrl model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PlantUrl, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PlantUrl, { exclude: 'where' }) filter?: FilterExcludingWhere<PlantUrl>
  ): Promise<PlantUrl> {
    return this.plantUrlRepository.findById(id, filter)
  }

  @patch('/plant-urls/{id}')
  @response(204, {
    description: 'PlantUrl PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantUrl, { partial: true }),
        },
      },
    })
    plantUrl: PlantUrl
  ): Promise<PlantUrl> {
    await this.plantUrlRepository.updateById(id, plantUrl)
    return this.plantUrlRepository.findById(id)
  }

  @put('/plant-urls/{id}')
  @response(204, {
    description: 'PlantUrl PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plantUrl: PlantUrl): Promise<void> {
    await this.plantUrlRepository.replaceById(id, plantUrl)
  }

  @del('/plant-urls/{id}')
  @response(204, {
    description: 'PlantUrl DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantUrlRepository.deleteById(id)
  }
}
