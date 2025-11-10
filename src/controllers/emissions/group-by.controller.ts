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

    // Validate hierarchy if parentId is provided
    if (groupBy.parentId) {
      const parent = await this.thisRepo.findById(groupBy.parentId)
      if (!parent) {
        throw new HttpErrors[400]('Parent group not found')
      }
      // Set depth based on parent
      groupBy.depth = parent.depth + 1
    } else {
      // Root level group
      groupBy.depth = 0
    }

    const created = await this.thisRepo.create(groupBy)
    return created
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

  // ==================== HIERARCHY ENDPOINTS ====================

  @get('/group-by/tree')
  @response(200, {
    description: 'Get hierarchical tree structure of all groups',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GroupBy, { includeRelations: true }),
        },
      },
    },
  })
  async getTree(
    @param.query.number('rootId') rootId?: number
  ): Promise<GroupBy[]> {
    return this.thisRepo.buildTree(rootId)
  }

  @get('/group-by/{id}/children')
  @response(200, {
    description: 'Get immediate children of a group',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GroupBy),
        },
      },
    },
  })
  async getChildren(
    @param.path.number('id') id: number
  ): Promise<GroupBy[]> {
    return this.thisRepo.find({
      where: { parentId: id },
      order: ['name ASC'],
    })
  }

  @get('/group-by/{id}/descendants')
  @response(200, {
    description: 'Get all descendant IDs of a group (recursive)',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            groupId: { type: 'number' },
            descendantIds: {
              type: 'array',
              items: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getDescendants(
    @param.path.number('id') id: number
  ): Promise<{ groupId: number; descendantIds: number[] }> {
    const descendantIds = await this.thisRepo.getDescendantIds(id)
    return { groupId: id, descendantIds }
  }

  @get('/group-by/{id}/ancestors')
  @response(200, {
    description: 'Get all ancestor IDs of a group (parent chain)',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            groupId: { type: 'number' },
            ancestorIds: {
              type: 'array',
              items: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getAncestors(
    @param.path.number('id') id: number
  ): Promise<{ groupId: number; ancestorIds: number[] }> {
    const ancestorIds = await this.thisRepo.getAncestorIds(id)
    return { groupId: id, ancestorIds }
  }

  @get('/group-by/{id}/siblings')
  @response(200, {
    description: 'Get sibling groups (same parent)',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GroupBy),
        },
      },
    },
  })
  async getSiblings(
    @param.path.number('id') id: number
  ): Promise<GroupBy[]> {
    const siblingIds = await this.thisRepo.getSiblingIds(id)
    if (siblingIds.length === 0) return []

    return this.thisRepo.find({
      where: { id: { inq: siblingIds } },
      order: ['name ASC'],
    })
  }

  @patch('/group-by/{id}/move')
  @response(200, {
    description: 'Move group to a new parent',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            group: getModelSchemaRef(GroupBy),
          },
        },
      },
    },
  })
  async moveGroup(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              newParentId: { type: 'number', nullable: true },
            },
          },
        },
      },
    })
    body: { newParentId: number | null }
  ): Promise<{ success: boolean; message: string; group: GroupBy }> {
    const { newParentId } = body

    // Validate hierarchy (prevent circular references)
    if (newParentId !== null) {
      await this.thisRepo.validateHierarchy(id, newParentId)
    }

    // Get the group
    const group = await this.thisRepo.findById(id)

    // Calculate new depth
    let newDepth = 0
    if (newParentId !== null) {
      const newParent = await this.thisRepo.findById(newParentId)
      newDepth = newParent.depth + 1
    }

    // Update the group
    await this.thisRepo.updateById(id, {
      parentId: newParentId ?? undefined,
      depth: newDepth,
    })

    // Update all descendants' depth
    await this.thisRepo.updateDepth(id, newDepth)

    // Get updated group
    const updatedGroup = await this.thisRepo.findById(id)

    return {
      success: true,
      message: `Group moved successfully to ${newParentId ? `parent ${newParentId}` : 'root level'}`,
      group: updatedGroup,
    }
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
