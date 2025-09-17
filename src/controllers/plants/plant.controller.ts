import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response, HttpErrors } from '@loopback/rest'
import { Plant } from '../../models'
import { PlantRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { authorize } from '@loopback/authorization'

@authenticate(JwtStrategy.UserAccessToken)
export class PlantController {
  constructor(
    @repository(PlantRepository)
    public plantRepository: PlantRepository
  ) {}

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @post('/plants')
  @response(200, {
    description: 'Plant model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Plant) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plant, {
            title: 'NewPlant',
            exclude: ['id'],
          }),
        },
      },
    })
    plant: Omit<Plant, 'id'>
  ): Promise<Plant> {
    return this.plantRepository.create(plant)
  }

  @get('/plants')
  @response(200, {
    description: 'Array of Plant model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Plant, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Plant) filter?: Filter<Plant>): Promise<Plant[]> {
    return this.plantRepository.find(filter)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @patch('/plants')
  @response(200, {
    description: 'Plant PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plant, { partial: true }),
        },
      },
    })
    plant: Plant,
    @param.where(Plant) where?: Where<Plant>
  ): Promise<Count> {
    return this.plantRepository.updateAll(plant, where)
  }

  @get('/plants/{id}')
  @response(200, {
    description: 'Plant model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Plant, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Plant, { exclude: 'where' }) filter?: FilterExcludingWhere<Plant>
  ): Promise<Plant> {
    return this.plantRepository.findById(id, filter)
  }

  @patch('/plants/{id}')
  @response(204, {
    description: 'Plant PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plant, { partial: true }),
        },
      },
    })
    plant: Plant
  ): Promise<Plant> {
    await this.plantRepository.updateById(id, plant)
    return this.findById(id)
  }

  @put('/plants/{id}')
  @response(204, {
    description: 'Plant PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plant: Plant): Promise<void> {
    await this.plantRepository.replaceById(id, plant)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @del('/plants/{id}')
  @response(204, {
    description: 'Plant DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantRepository.deleteById(id)
  }

  @patch('/plants/{id}/is-active')
  @response(204, {
    description: 'Plant PATCH success',
  })
  async updateIsActiveById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plant, { partial: true }),
        },
      },
    })
    plant: Plant
  ): Promise<Plant> {
    const allActivePlants = await this.find({ where: { is_active: true } })
    const totalAllActivePlantsAfter = allActivePlants.length + (plant.is_active ? 1 : -1)

    if (totalAllActivePlantsAfter >= 2) {
      await this.plantRepository.updateById(id, plant)
      return this.findById(id)
    } else {
      throw new HttpErrors.BadRequest('Plant at least should 2 is_active at a time')
    }
  }
}
