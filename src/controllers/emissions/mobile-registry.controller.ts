import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { MobileRegistry } from '../../models'
import { EmissionFactorRepository, MobileRegistryRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { BeforeTransform, JwtStrategy, transformQueries } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class MobileRegistryController {
  constructor(
    @repository(MobileRegistryRepository)
    public thisRepo: MobileRegistryRepository,
    @repository(EmissionFactorRepository)
    public emissionFactorRepository: EmissionFactorRepository,
  ) {
  }

  @post('/mobile-registry')
  @response(200, {
    description: 'MobileRegistry model instance',
    content: { 'application/json': { schema: getModelSchemaRef(MobileRegistry) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MobileRegistry, {
            title: 'NewMobileRegistry',
            exclude: ['id'],
          }),
        },
      },
    })
    mobileRegistry: Omit<MobileRegistry, 'id'>,
  ): Promise<MobileRegistry> {
    return this.thisRepo.create(mobileRegistry)
  }

  @get('/mobile-registry/count')
  @response(200, {
    description: 'MobileRegistry model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(MobileRegistry) where?: Where<MobileRegistry>): Promise<Count> {
    return this.thisRepo.count(where)
  }

  @get('/mobile-registry')
  @response(200, {
    description: 'Array of MobileRegistry model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(MobileRegistry, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(MobileRegistry) filter?: Filter<MobileRegistry>): Promise<MobileRegistry[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/mobile-registry')
  @response(200, {
    description: 'MobileRegistry PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MobileRegistry, { partial: true }),
        },
      },
    })
    mobileRegistry: MobileRegistry,
    @param.where(MobileRegistry) where?: Where<MobileRegistry>,
  ): Promise<Count> {
    return this.thisRepo.updateAll(mobileRegistry, where)
  }

  @get('/mobile-registry/{id}')
  @response(200, {
    description: 'MobileRegistry model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(MobileRegistry, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(MobileRegistry, { exclude: 'where' }) filter?: FilterExcludingWhere<MobileRegistry>,
  ): Promise<MobileRegistry> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/mobile-registry/{id}')
  @response(204, {
    description: 'MobileRegistry PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MobileRegistry, { partial: true }),
        },
      },
    })
    mobileRegistry: MobileRegistry,
  ): Promise<void> {
    await this.thisRepo.updateById(id, mobileRegistry)
  }

  @put('/mobile-registry/{id}')
  @response(204, {
    description: 'MobileRegistry PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() mobileRegistry: MobileRegistry): Promise<void> {
    await this.thisRepo.replaceById(id, mobileRegistry)
  }

  @del('/mobile-registry/{id}')
  @response(204, {
    description: 'MobileRegistry DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.thisRepo.deleteById(id)
  }

  @get('/mobile-registry/optimize')
  @response(200, { description: 'Array of Optimize MobileRegistry model instances' })
  async optimize(
    @param.query.number('pageIndex') pageIndex: number = 0,
    @param.query.number('pageSize') pageSize: number = 10,
    @param.query.string('q') q: string,
    @param.array('sorting', 'query', { type: 'object' }) sorting: BeforeTransform['sorting'],
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
  ) {
    const constant = { groupByIds: [], dateRange: [new Date(), new Date()] as [Date, Date], useDebug: false }

    const mobileCombustionQ = await this.emissionFactorRepository.dropdown('mobile_combustion')

    const merged = transformQueries({ db: `cgss_${tenantId}`, pageSize, pageIndex, sorting, q, ...constant })

    const qs = ['identity_no', 'model'].map((col) => `mr.${col} LIKE '%${merged.q}%'`).join(` or `)

    const whereClause = `
        mr.id IS NOT NULL
        ${merged.q ? `AND (${qs})` : ''}
     `

    const mainQuery = `
        SELECT mr.id                            AS id,
               mr.identity_no                   AS identity_no,
               mr.model                         AS model,
               mr.EF_MobileCombustionDistanceId AS EF_MobileCombustionDistanceId,
               mr.status                        AS status
        FROM ${merged.db}.MobileRegistry AS mr
        WHERE ${whereClause}
        ORDER BY ${merged.sorting ?? 'identity_no ASC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0};
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT mr.id FROM ${merged.db}.MobileRegistry AS mr WHERE ${whereClause})
                 AS CountedRows;
    `

    const [rows, rowCount] = await Promise.all([
      this.thisRepo.execute(mainQuery)
        .then((result) => {
          return result?.map((row: any) => {
            const found = mobileCombustionQ.distance.find((d) => d.id === row.EF_MobileCombustionDistanceId)
            const foundLitre = mobileCombustionQ.litre.find((l) => l.id === found?.litreId)

            const vehicle = found ? found.vehicle_type : null
            const fuel = found ? found.fuel_type : null
            const litre = foundLitre ? foundLitre.fuel_type : 'n/a'

            return { ...row, vehicle, fuel, litre }
          })
        }) as Promise<{ id: number; name: string; status: 'active' | 'inactive' }[]>,
      this.thisRepo.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>,
    ])

    return { rows, rowCount }
  }
}
