import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest'
import { Enduser } from '../../models/enduser.model'
import { EnduserRepository } from '../../repositories/enduser.repository'

export class EnduserController {
  constructor(
    @repository(EnduserRepository)
    public enduserRepository: EnduserRepository
  ) {}

  @post('/endusers')
  @response(200, {
    description: 'Enduser model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Enduser) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Enduser, {
            title: 'NewEnduser',
            exclude: ['id'],
          }),
        },
      },
    })
    enduser: Omit<Enduser, 'id'>
  ): Promise<Enduser> {
    return this.enduserRepository.create(enduser)
  }

  @get('/endusers')
  @response(200, {
    description: 'Array of Enduser model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Enduser, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Enduser) filter?: Filter<Enduser>): Promise<Enduser[]> {
    return this.enduserRepository.find(filter)
  }

  @patch('/endusers')
  @response(200, {
    description: 'Enduser PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Enduser, { partial: true }),
        },
      },
    })
    enduser: Enduser,
    @param.where(Enduser) where?: Where<Enduser>
  ): Promise<Count> {
    return this.enduserRepository.updateAll(enduser, where)
  }

  @get('/endusers/{id}')
  @response(200, {
    description: 'Enduser model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Enduser, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Enduser, { exclude: 'where' }) filter?: FilterExcludingWhere<Enduser>
  ): Promise<Enduser> {
    return this.enduserRepository.findById(id, filter)
  }

  @patch('/endusers/{id}')
  @response(204, {
    description: 'Enduser PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Enduser, { partial: true }),
        },
      },
    })
    enduser: Enduser
  ): Promise<void> {
    await this.enduserRepository.updateById(id, enduser)
  }

  @put('/endusers/{id}')
  @response(204, {
    description: 'Enduser PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() enduser: Enduser): Promise<void> {
    await this.enduserRepository.replaceById(id, enduser)
  }

  @del('/endusers/{id}')
  @response(204, {
    description: 'Enduser DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.enduserRepository.deleteById(id)
  }
}
