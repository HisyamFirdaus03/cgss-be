import { authorize } from '@loopback/authorization'
import { Filter, FilterExcludingWhere, repository } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response, HttpErrors } from '@loopback/rest'
import { EmissionFactor } from '../../models'
import { EmissionFactorRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { JwtStrategy, UserAccessLevel } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class EmissionFactorController {
  constructor(
    @repository(EmissionFactorRepository)
    public emissionFactorRepository: EmissionFactorRepository
  ) {}

  @post('/emission-factors')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(200, {
    description: 'EmissionFactor model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionFactor) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionFactor, {
            title: 'NewEmissionFactor',
            exclude: ['id'],
          }),
        },
      },
    })
    emissionFactor: Omit<EmissionFactor, 'id'>
  ): Promise<EmissionFactor> {
    return this.emissionFactorRepository.create(emissionFactor)
  }

  @get('/emission-factors')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(200, {
    description: 'Array of EmissionFactor model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionFactor, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(EmissionFactor) filter?: Filter<EmissionFactor>): Promise<EmissionFactor[]> {
    return this.emissionFactorRepository.find(filter)
  }

  @get('/emission-factors/{id}')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(200, {
    description: 'EmissionFactor model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmissionFactor, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmissionFactor, { exclude: 'where' }) filter?: FilterExcludingWhere<EmissionFactor>
  ): Promise<EmissionFactor> {
    return this.emissionFactorRepository.findById(id, filter)
  }

  @patch('/emission-factors/{id}')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(204, {
    description: 'EmissionFactor PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmissionFactor, { partial: true }),
        },
      },
    })
    emissionFactor: EmissionFactor
  ): Promise<void> {
    await this.emissionFactorRepository.updateById(id, emissionFactor)
  }

  @put('/emission-factors/{id}')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(204, {
    description: 'EmissionFactor PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() emissionFactor: EmissionFactor): Promise<void> {
    await this.emissionFactorRepository.replaceById(id, emissionFactor)
  }

  @del('/emission-factors/{id}')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(204, {
    description: 'EmissionFactor DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.emissionFactorRepository.deleteById(id)
  }

  @get('/emission-factors/dropdown')
  @response(200, {
    description: 'Array of EmissionFactor model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmissionFactor, { includeRelations: true }),
        },
      },
    },
  })
  async dropdown(@param.query.string('field') field: Parameters<typeof this.emissionFactorRepository.dropdown>[0]): Promise<any> {
    // await delay(50000)
    return this.emissionFactorRepository.dropdown(field)
  }

  @patch('/emission-factors')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(204, { description: 'EmissionFactor PATCH all success' })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              payload: {
                type: 'array',
                items: getModelSchemaRef(EmissionFactor, { partial: true }),
              },
            },
            required: ['payload'],
            additionalProperties: false,
          },
        },
      },
    })
    { payload }: { payload: EmissionFactor[] }
  ): Promise<any> {
    for (const { id, ...EF } of payload) {
      await this.emissionFactorRepository.updateById(id, EF)
    }
  }

  @post('/emission-factors/add-year')
  @authorize({ allowedRoles: [UserAccessLevel.name.root, UserAccessLevel.name.adminSystem]})
  @response(200, {
    description: 'EmissionFactor model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmissionFactor) } },
  })
  async addYear(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              from: { type: 'integer' },
              to: { type: 'integer' },
            },
          },
        },
      },
    })
    { from, to }: { from: number; to: number }
  ): Promise<any> {
    const ef = await this.emissionFactorRepository.findOne({ where: { year: from } })

    if (!ef) throw new HttpErrors.BadRequest('Invalid year')

    delete ef.id
    ef.year = to

    return this.emissionFactorRepository.create(ef)
  }
}
