import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { PlantActual } from '../../models'
import { PlantActualRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class PlantActualController {
  constructor(
    @repository(PlantActualRepository)
    public plantActualRepository: PlantActualRepository
  ) {}

  @post('/plant-actuals')
  @response(200, {
    description: 'PlantActual model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantActual) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantActual, {
            title: 'NewPlantActual',
            exclude: ['id'],
          }),
        },
      },
    })
    plantActual: Omit<PlantActual, 'id'>
  ): Promise<PlantActual> {
    return this.plantActualRepository.create(plantActual)
  }

  @get('/plant-actuals')
  @response(200, {
    description: 'Array of PlantActual model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PlantActual, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(PlantActual) filter?: Filter<PlantActual>): Promise<PlantActual[]> {
    return this.plantActualRepository.find(filter)
  }

  @patch('/plant-actuals')
  @response(200, {
    description: 'PlantActual PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantActual, { partial: true }),
        },
      },
    })
    plantActual: PlantActual,
    @param.where(PlantActual) where?: Where<PlantActual>
  ): Promise<Count> {
    return this.plantActualRepository.updateAll(plantActual, where)
  }

  @get('/plant-actuals/{id}')
  @response(200, {
    description: 'PlantActual model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PlantActual, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PlantActual, { exclude: 'where' }) filter?: FilterExcludingWhere<PlantActual>
  ): Promise<PlantActual> {
    return this.plantActualRepository.findById(id, filter)
  }

  @patch('/plant-actuals/{id}')
  @response(204, {
    description: 'PlantActual PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantActual, { partial: true }),
        },
      },
    })
    plantActual: PlantActual
  ): Promise<void> {
    await this.plantActualRepository.updateById(id, plantActual)
  }

  @put('/plant-actuals/{id}')
  @response(204, {
    description: 'PlantActual PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plantActual: PlantActual): Promise<void> {
    await this.plantActualRepository.replaceById(id, plantActual)
  }

  @del('/plant-actuals/{id}')
  @response(204, {
    description: 'PlantActual DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantActualRepository.deleteById(id)
  }
}
