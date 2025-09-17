import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { PlantActualDetail } from '../../models'
import { PlantActualDetailRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class PlantActualDetailController {
  constructor(
    @repository(PlantActualDetailRepository)
    public plantActualDetailRepository: PlantActualDetailRepository
  ) {}

  @post('/plant-actual-details')
  @response(200, {
    description: 'PlantActualDetail model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantActualDetail) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantActualDetail, {
            title: 'NewPlantActualDetail',
            exclude: ['id'],
          }),
        },
      },
    })
    plantActualDetail: Omit<PlantActualDetail, 'id'>
  ): Promise<PlantActualDetail> {
    return this.plantActualDetailRepository.create(plantActualDetail)
  }

  @get('/plant-actual-details')
  @response(200, {
    description: 'Array of PlantActualDetail model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PlantActualDetail, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(PlantActualDetail) filter?: Filter<PlantActualDetail>): Promise<PlantActualDetail[]> {
    return this.plantActualDetailRepository.find(filter)
  }

  @patch('/plant-actual-details')
  @response(200, {
    description: 'PlantActualDetail PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantActualDetail, { partial: true }),
        },
      },
    })
    plantActualDetail: PlantActualDetail,
    @param.where(PlantActualDetail) where?: Where<PlantActualDetail>
  ): Promise<Count> {
    return this.plantActualDetailRepository.updateAll(plantActualDetail, where)
  }

  @get('/plant-actual-details/{id}')
  @response(200, {
    description: 'PlantActualDetail model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PlantActualDetail, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PlantActualDetail, { exclude: 'where' }) filter?: FilterExcludingWhere<PlantActualDetail>
  ): Promise<PlantActualDetail> {
    return this.plantActualDetailRepository.findById(id, filter)
  }

  @patch('/plant-actual-details/{id}')
  @response(204, {
    description: 'PlantActualDetail PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantActualDetail, { partial: true }),
        },
      },
    })
    plantActualDetail: PlantActualDetail
  ): Promise<void> {
    await this.plantActualDetailRepository.updateById(id, plantActualDetail)
  }

  @put('/plant-actual-details/{id}')
  @response(204, {
    description: 'PlantActualDetail PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plantActualDetail: PlantActualDetail): Promise<void> {
    await this.plantActualDetailRepository.replaceById(id, plantActualDetail)
  }

  @del('/plant-actual-details/{id}')
  @response(204, {
    description: 'PlantActualDetail DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantActualDetailRepository.deleteById(id)
  }
}
