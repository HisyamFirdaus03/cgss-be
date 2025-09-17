import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { PlantSpecies } from '../../models'
import { PlantSpeciesRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class PlantSpeciesController {
  constructor(
    @repository(PlantSpeciesRepository)
    public plantSpeciesRepository: PlantSpeciesRepository
  ) {}

  @post('/plant-species')
  @response(200, {
    description: 'PlantSpecies model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantSpecies) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantSpecies, {
            title: 'NewPlantSpecies',
            exclude: ['id'],
          }),
        },
      },
    })
    plantSpecies: Omit<PlantSpecies, 'id'>
  ): Promise<PlantSpecies> {
    return this.plantSpeciesRepository.create(plantSpecies)
  }

  @get('/plant-species')
  @response(200, {
    description: 'Array of PlantSpecies model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PlantSpecies, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(PlantSpecies) filter?: Filter<PlantSpecies>): Promise<PlantSpecies[]> {
    return this.plantSpeciesRepository.find(filter)
  }

  @patch('/plant-species')
  @response(200, {
    description: 'PlantSpecies PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantSpecies, { partial: true }),
        },
      },
    })
    plantSpecies: PlantSpecies,
    @param.where(PlantSpecies) where?: Where<PlantSpecies>
  ): Promise<Count> {
    return this.plantSpeciesRepository.updateAll(plantSpecies, where)
  }

  @get('/plant-species/{id}')
  @response(200, {
    description: 'PlantSpecies model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PlantSpecies, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PlantSpecies, { exclude: 'where' }) filter?: FilterExcludingWhere<PlantSpecies>
  ): Promise<PlantSpecies> {
    return this.plantSpeciesRepository.findById(id, filter)
  }

  @patch('/plant-species/{id}')
  @response(204, {
    description: 'PlantSpecies PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantSpecies, { partial: true }),
        },
      },
    })
    plantSpecies: PlantSpecies
  ): Promise<void> {
    await this.plantSpeciesRepository.updateById(id, plantSpecies)
  }

  @put('/plant-species/{id}')
  @response(204, {
    description: 'PlantSpecies PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plantSpecies: PlantSpecies): Promise<void> {
    await this.plantSpeciesRepository.replaceById(id, plantSpecies)
  }

  @del('/plant-species/{id}')
  @response(204, {
    description: 'PlantSpecies DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantSpeciesRepository.deleteById(id)
  }
}
