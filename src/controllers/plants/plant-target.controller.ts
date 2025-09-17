import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { PlantTarget } from '../../models'
import { PlantTargetRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class PlantTargetController {
  constructor(
    @repository(PlantTargetRepository)
    public plantTargetRepository: PlantTargetRepository
  ) {}

  @post('/plant-targets')
  @response(200, {
    description: 'PlantTarget model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantTarget) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantTarget, {
            title: 'NewPlantTarget',
            exclude: ['id'],
          }),
        },
      },
    })
    plantTarget: Omit<PlantTarget, 'id'>
  ): Promise<PlantTarget> {
    return this.plantTargetRepository.create(plantTarget)
  }

  @get('/plant-targets')
  @response(200, {
    description: 'Array of PlantTarget model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PlantTarget, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(PlantTarget) filter?: Filter<PlantTarget>): Promise<PlantTarget[]> {
    return this.plantTargetRepository.find(filter)
  }

  @patch('/plant-targets')
  @response(200, {
    description: 'PlantTarget PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantTarget, { partial: true }),
        },
      },
    })
    plantTarget: PlantTarget,
    @param.where(PlantTarget) where?: Where<PlantTarget>
  ): Promise<Count> {
    return this.plantTargetRepository.updateAll(plantTarget, where)
  }

  @get('/plant-targets/{id}')
  @response(200, {
    description: 'PlantTarget model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PlantTarget, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PlantTarget, { exclude: 'where' }) filter?: FilterExcludingWhere<PlantTarget>
  ): Promise<PlantTarget> {
    return this.plantTargetRepository.findById(id, filter)
  }

  @patch('/plant-targets/{id}')
  @response(204, {
    description: 'PlantTarget PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantTarget, { partial: true }),
        },
      },
    })
    plantTarget: PlantTarget
  ): Promise<void> {
    await this.plantTargetRepository.updateById(id, plantTarget)
  }

  @put('/plant-targets/{id}')
  @response(204, {
    description: 'PlantTarget PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() plantTarget: PlantTarget): Promise<void> {
    await this.plantTargetRepository.replaceById(id, plantTarget)
  }

  @del('/plant-targets/{id}')
  @response(204, {
    description: 'PlantTarget DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.plantTargetRepository.deleteById(id)
  }

  @post('/plant-targets/upsert')
  @response(200, {
    description: 'PlantTarget upsert operation',
    content: { 'application/json': { schema: getModelSchemaRef(PlantTarget) } },
  })
  async upsert(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantTarget, { partial: true }),
        },
      },
    })
    plantTarget: Partial<PlantTarget>
  ): Promise<void> {
    const where = { plantId: plantTarget.plantId, year: plantTarget.year }
    const recordExist = await this.plantTargetRepository.find({ where })

    if (recordExist.length === 1) {
      await this.plantTargetRepository.updateById(recordExist[0].id as number, plantTarget as PlantTarget)
    } else {
      await this.plantTargetRepository.create(plantTarget)
    }

    return
  }

  @post('/plant-targets/deleteByCell')
  @response(200, {
    description: 'PlantTarget model instance',
    content: { 'application/json': { schema: getModelSchemaRef(PlantTarget) } },
  })
  async deleteByCell(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlantTarget, { partial: true }),
        },
      },
    })
    plantTarget: Omit<PlantTarget, 'id'>
  ) {
    const found = await this.plantTargetRepository.find({
      where: { plantId: plantTarget.plantId, year: plantTarget.year },
    })

    if (found.length) {
      await this.plantTargetRepository.deleteById((found[0] as { id: number }).id)
    }
  }
}
