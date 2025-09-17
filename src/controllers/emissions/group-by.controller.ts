import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response, HttpErrors } from '@loopback/rest'
import { GroupBy } from '../../models'
import { CompanyInfoRepository, GroupByRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { BeforeTransform, JwtStrategy, transformQueries } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class GroupByController {
  constructor(
    @repository(GroupByRepository)
    public thisRepo: GroupByRepository,

    @repository(CompanyInfoRepository)
    private companyInfoRepository: CompanyInfoRepository
  ) {}

  @post('/group-by')
  @response(200, {
    description: 'GroupBy model instance',
    content: { 'application/json': { schema: getModelSchemaRef(GroupBy) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupBy, {
            title: 'NewGroupBy',
            exclude: ['id'],
          }),
        },
      },
    })
    groupBy: Omit<GroupBy, 'id'>,
    @param.header.string('x-tenant-id') tenantId: string = 'demo'
  ): Promise<GroupBy> {
    const maxGroups = await this.companyInfoRepository.getMaxGroups(tenantId)
    const noOfGroups = await this.thisRepo.count()

    if (noOfGroups.count >= maxGroups) {
      throw new HttpErrors[403]('Sorry you have reached maximum number of groups. Please reach out to admin')
    }

    return this.thisRepo.create(groupBy)
  }

  @get('/group-by')
  @response(200, {
    description: 'Array of GroupBy model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GroupBy, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(GroupBy) filter?: Filter<GroupBy>): Promise<GroupBy[]> {
    return this.thisRepo.find(filter)
  }

  @patch('/group-by')
  @response(200, {
    description: 'GroupBy PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupBy, { partial: true }),
        },
      },
    })
    groupBy: GroupBy,
    @param.where(GroupBy) where?: Where<GroupBy>
  ): Promise<Count> {
    return this.thisRepo.updateAll(groupBy, where)
  }

  @get('/group-by/{id}')
  @response(200, {
    description: 'GroupBy model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GroupBy, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(GroupBy, { exclude: 'where' }) filter?: FilterExcludingWhere<GroupBy>
  ): Promise<GroupBy> {
    return this.thisRepo.findById(id, filter)
  }

  @patch('/group-by/{id}')
  @response(204, {
    description: 'GroupBy PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupBy, { partial: true }),
        },
      },
    })
    groupBy: GroupBy
  ): Promise<void> {
    await this.thisRepo.updateById(id, groupBy)
  }

  @put('/group-by/{id}')
  @response(204, {
    description: 'GroupBy PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() groupBy: GroupBy): Promise<void> {
    await this.thisRepo.replaceById(id, groupBy)
  }

  @del('/group-by/{id}')
  @response(204, {
    description: 'GroupBy DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.thisRepo.deleteById(id)
  }

  @get('/group-by/optimize')
  @response(200, { description: 'Array of Optimize GroupBy model instances' })
  async optimize(
    @param.query.number('pageIndex') pageIndex: number = 0,
    @param.query.number('pageSize') pageSize: number = 10,
    @param.query.string('q') q: string,
    @param.array('sorting', 'query', { type: 'object' }) sorting: BeforeTransform['sorting'],
    @param.header.string('x-tenant-id') tenantId: string = 'demo'
  ) {
    const constant = { groupByIds: [], dateRange: [new Date(), new Date()] as [Date, Date], useDebug: false }
    const merged = transformQueries({ db: `cgss_${tenantId}`, pageSize, pageIndex, sorting, q, ...constant })

    const whereClause = `
        groupBy.id IS NOT NULL
        ${merged.q ? `AND groupBy.name LIKE '%${merged.q}%'` : ''}
     `

    const mainQuery = `
        SELECT
            groupBy.id AS id,
            groupBy.name AS name,
            groupBy.status AS status
        FROM
            ${merged.db}.GroupBy AS groupBy
        WHERE
            ${whereClause}
        ORDER BY
            ${merged.sorting ?? 'name ASC'}
        LIMIT ${merged.page?.limit ?? 10}
        OFFSET ${merged.page?.skip ?? 0};
    `

    const countQuery = `
        SELECT
            COUNT(*) AS totalCount
        FROM (SELECT groupBy.id FROM ${merged.db}.GroupBy AS groupBy WHERE ${whereClause})
                 AS CountedRows;
    `

    const [rows, rowCount] = await Promise.all([
      this.thisRepo.execute(mainQuery) as Promise<{ id: number; name: string; status: 'active' | 'inactive' }[]>,
      this.thisRepo.execute(countQuery).then((_) => _[0].totalCount) as Promise<number>,
    ])

    return { rows, rowCount }
  }
}
