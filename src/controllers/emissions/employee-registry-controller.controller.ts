import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { EmissionFactor, EmployeeRegistry } from '../../models'
import { EmployeeRegistryRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { BeforeTransform, JwtStrategy, transformQueries } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class EmployeeRegistryControllerController {
  constructor(
    @repository(EmployeeRegistryRepository)
    public thisRepo: EmployeeRegistryRepository,
  ) {
  }

  @post('/employee-registry')
  @response(200, {
    description: 'EmployeeRegistry model instance',
    content: { 'application/json': { schema: getModelSchemaRef(EmployeeRegistry) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmployeeRegistry, {
            title: 'NewEmployeeRegistry',
            exclude: ['id'],
          }),
        },
      },
    })
    employeeRegistry: Omit<EmployeeRegistry, 'id'>,
  ): Promise<EmployeeRegistry> {
    return this.thisRepo.create(employeeRegistry)
  }

  @get('/employee-registry/count')
  @response(200, {
    description: 'EmployeeRegistry model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(EmployeeRegistry) where?: Where<EmployeeRegistry>): Promise<Count> {
    return this.thisRepo.count(where)
  }

  @get('/employee-registry')
  @response(200, {
    description: 'Array of EmployeeRegistry model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmployeeRegistry, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(EmployeeRegistry) filter?: Filter<EmployeeRegistry>): Promise<EmployeeRegistry[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/employee-registry')
  @response(200, {
    description: 'EmployeeRegistry PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmployeeRegistry, { partial: true }),
        },
      },
    })
    employeeRegistry: EmployeeRegistry,
    @param.where(EmployeeRegistry) where?: Where<EmployeeRegistry>,
  ): Promise<Count> {
    return this.thisRepo.updateAll(employeeRegistry, where)
  }

  @get('/employee-registry/{id}')
  @response(200, {
    description: 'EmployeeRegistry model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmployeeRegistry, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(EmployeeRegistry, { exclude: 'where' }) filter?: FilterExcludingWhere<EmployeeRegistry>,
  ): Promise<EmployeeRegistry> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/employee-registry/{id}')
  @response(204, {
    description: 'EmployeeRegistry PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmployeeRegistry, { partial: true }),
        },
      },
    })
    employeeRegistry: EmployeeRegistry,
  ): Promise<void> {
    await this.thisRepo.updateById(id, employeeRegistry)
  }

  @put('/employee-registry/{id}')
  @response(204, {
    description: 'EmployeeRegistry PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() employeeRegistry: EmployeeRegistry): Promise<void> {
    await this.thisRepo.replaceById(id, employeeRegistry)
  }

  @del('/employee-registry/{id}')
  @response(204, {
    description: 'EmployeeRegistry DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.thisRepo.deleteById(id)
  }

  @get('/employee-registry/optimize')
  @response(200, { description: 'Array of Optimize EmployeeRegistry model instances' })
  async optimize(
    @param.query.number('pageIndex') pageIndex: number = 0,
    @param.query.number('pageSize') pageSize: number = 10,
    @param.query.string('q') q: string,
    @param.array('sorting', 'query', { type: 'object' }) sorting: BeforeTransform['sorting'],
    @param.header.string('x-tenant-id') tenantId: string = 'demo',
  ) {
    const constant = { groupByIds: [], dateRange: [new Date(), new Date()] as [Date, Date], useDebug: false }
    const merged = transformQueries({ db: `cgss_${tenantId}`, pageSize, pageIndex, sorting, q, ...constant })

    const qs = ['name', 'status', 'staffId', 'addressFrom', 'addressTo', 'distance']
      .map((col) => `er.${col} LIKE '%${merged.q}%'`)
      .join(` or `)

    const whereClause = `
        er.id IS NOT NULL
        ${merged.q ? `AND (${qs})` : ''}
     `

    const mainQuery = `
        SELECT er.id                            AS id,
               er.name                          AS name,
               er.status                        AS status,
               er.staffId                       AS staffId,
               er.addressFrom                   AS addressFrom,
               er.addressTo                     AS addressTo,
               er.distance                      AS distance,
               er.avg_day_working_per_month     AS avg_day_working_per_month,
               er.EF_MobileCombustionDistanceId AS EF_MobileCombustionDistanceId
        FROM ${merged.db}.EmployeeRegistry AS er
        WHERE ${whereClause}
        ORDER BY ${merged.sorting ?? 'name ASC'} LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0};
    `

    const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM (SELECT er.id FROM ${merged.db}.EmployeeRegistry AS er WHERE ${whereClause})
                 AS CountedRows;
    `

    const [rows, rowCount] = await Promise.all([
      this.thisRepo.execute(mainQuery) as Promise<
        {
          id: number
          name: string
          status: 'active' | 'inactive'
          staffId: string
          addressFrom: string
          addressTo: string
          distance: number
          avg_day_working_per_month: number
          EF_MobileCombustionDistanceId: EmissionFactor['mobile_combustion']['distance'][0]['id']
        }[]
      >,
      this.thisRepo.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>,
    ])

    return { rows, rowCount }
  }
}
