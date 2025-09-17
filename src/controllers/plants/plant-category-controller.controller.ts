import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { PlantCategory } from '../../models'
import { PlantCategoryRepository } from '../../repositories'

export class PlantCategoryControllerController {
  constructor(
    @repository(PlantCategoryRepository)
    public plantCategoryRepository: PlantCategoryRepository
  ) {}

  @post('/plant-categories')
  @response(200, {
    description: 'PlantCategory model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantCategory) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantCategory, {
            title: 'NewPlantCategory',
            exclude: ['id'],
          }),
        },
      },
    })
    plantCategory: Omit<PlantCategory, 'id'>
  ): Promise<PlantCategory> {
    return this.plantCategoryRepository.create(plantCategory)
  }

  @get('/plant-categories')
  @response(200, {
    description: 'Array of PlantCategory model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PlantCategory, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(PlantCategory) filter?: Filter<PlantCategory>): Promise<PlantCategory[]> {
    return this.plantCategoryRepository.find(filter)
  }

  @patch('/plant-categories')
  @response(200, {
    description: 'PlantCategory PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantCategory, { partial: true }),
        },
      },
    })
    plantCategory: PlantCategory,
    @param.where(PlantCategory) where?: Where<PlantCategory>
  ): Promise<Count> {
    return this.plantCategoryRepository.updateAll(plantCategory, where)
  }

  @get('/plant-categories/{id}')
  @response(200, {
    description: 'PlantCategory model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PlantCategory, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PlantCategory, { exclude: 'where' }) filter?: FilterExcludingWhere<PlantCategory>
  ): Promise<PlantCategory> {
    return this.plantCategoryRepository.findById(id, filter)
  }

  @patch('/plant-categories/{id}')
  @response(204, {
    description: 'PlantCategory PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantCategory, { partial: true }),
        },
      },
    })
    plantCategory: PlantCategory
  ): Promise<void> {
    await this.plantCategoryRepository.updateById(id, plantCategory)
  }

  @put('/plant-categories/{id}')
  @response(204, {
    description: 'PlantCategory PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plantCategory: PlantCategory): Promise<void> {
    await this.plantCategoryRepository.replaceById(id, plantCategory)
  }

  @del('/plant-categories/{id}')
  @response(204, {
    description: 'PlantCategory DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantCategoryRepository.deleteById(id)
  }
}
