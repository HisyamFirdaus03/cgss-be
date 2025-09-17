import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../common'
import { CompanyInfo } from '../models'
import { CompanyInfoRepository } from '../repositories'

@authenticate(JwtStrategy.UserAccessToken)
export class CompanyInfoController {
  constructor(@repository(CompanyInfoRepository) public thisRepo: CompanyInfoRepository) {
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @post('/company-info')
  @response(200, {
    description: 'CompanyInfo model instance',
    content: { 'application/json': { schema: getModelSchemaRef(CompanyInfo) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyInfo, {
            title: 'NewCompanyInfo',
            exclude: ['id'],
          }),
        },
      },
    })
    companyInfo: Omit<CompanyInfo, 'id'>,
  ): Promise<CompanyInfo> {
    return this.thisRepo.create(companyInfo)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @get('/company-info')
  @response(200, {
    description: 'Array of CompanyInfo model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CompanyInfo, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(CompanyInfo) filter?: Filter<CompanyInfo>): Promise<CompanyInfo[]> {
    return this.thisRepo.find(filter)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @patch('/company-info')
  @response(200, {
    description: 'CompanyInfo PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyInfo, { partial: true }),
        },
      },
    })
    companyInfo: CompanyInfo,
    @param.where(CompanyInfo) where?: Where<CompanyInfo>,
  ): Promise<Count> {
    return this.thisRepo.updateAll(companyInfo, where)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @get('/company-info/{id}')
  @response(200, {
    description: 'CompanyInfo model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(CompanyInfo, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(CompanyInfo, { exclude: 'where' }) filter?: FilterExcludingWhere<CompanyInfo>,
  ): Promise<CompanyInfo> {
    return this.thisRepo.findById(id, filter)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @patch('/company-info/{id}')
  @response(204, {
    description: 'CompanyInfo PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyInfo, { partial: true }),
        },
      },
    })
    companyInfo: CompanyInfo,
  ): Promise<void> {
    await this.thisRepo.updateById(id, companyInfo)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @put('/company-info/{id}')
  @response(204, {
    description: 'CompanyInfo PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() companyInfo: CompanyInfo): Promise<void> {
    await this.thisRepo.replaceById(id, companyInfo)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminCompany, UserAccessLevel.name.adminSystem, UserAccessLevel.name.root] })
  @del('/company-info/{id}')
  @response(204, {
    description: 'CompanyInfo DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.thisRepo.deleteById(id)
  }

  @authenticate.skip()
  @get('/company-info/slug')
  @response(200, {
    description: 'CompanyInfo model slug',
    content: {
      'application/json': {
        schema: getModelSchemaRef(CompanyInfo, { includeRelations: true }),
      },
    },
  })
  async findBySlug(@param.header.string('x-tenant-id') tenantId: string = 'demo'): Promise<any> {
    return await this.findBy(tenantId)
  }

  private async findBy(tenantId: string, key?: keyof CompanyInfo): Promise<any> {
    return {
      ...(await this.thisRepo.findOne({
        ...(key ? { fields: [key] } : {}),
        where: {
          and: [
            { slug: tenantId ? tenantId : 'demo' },
            { status: 'active' },
            // { status: 'inactive' },
            // { expiredAt: { and: [{  gte: new Date() }, { ne : undefined }]} }
          ],
        },
      })),
      test: 1,
    }
  }
}
