import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { Permission } from '../../models'
import { PermissionRepository } from '../../repositories'

@authenticate(JwtStrategy.UserAccessToken)
export class PermissionController {
  constructor(
    @repository(PermissionRepository)
    public permissionRepository: PermissionRepository,
  ) {
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
  @post('/permissions')
  @response(200, {
    description: 'Permission model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Permission) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, {
            title: 'NewPermission',
            exclude: ['id'],
          }),
        },
      },
    })
    permission: Omit<Permission, 'id'>,
  ): Promise<Permission> {
    return this.permissionRepository.create(permission)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
  @get('/permissions/count')
  @response(200, {
    description: 'Permission model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(Permission) where?: Where<Permission>): Promise<Count> {
    return this.permissionRepository.count(where)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
  @get('/permissions')
  @response(200, {
    description: 'Array of Permission model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Permission, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Permission) filter?: Filter<Permission>): Promise<Permission[]> {
    return this.permissionRepository.find(filter)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
  @patch('/permissions')
  @response(200, {
    description: 'Permission PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, { partial: true }),
        },
      },
    })
    permission: Permission,
    @param.where(Permission) where?: Where<Permission>,
  ): Promise<Count> {
    return this.permissionRepository.updateAll(permission, where)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
  @get('/permissions/{id}')
  @response(200, {
    description: 'Permission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Permission, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Permission, { exclude: 'where' }) filter?: FilterExcludingWhere<Permission>,
  ): Promise<Permission> {
    return this.permissionRepository.findById(id, filter)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
  @patch('/permissions/{id}')
  @response(204, {
    description: 'Permission PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, { partial: true }),
        },
      },
    })
    permission: Permission,
  ): Promise<void> {
    await this.permissionRepository.updateById(id, permission)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
  @put('/permissions/{id}')
  @response(204, {
    description: 'Permission PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() permission: Permission): Promise<void> {
    await this.permissionRepository.replaceById(id, permission)
  }

  @authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
  @del('/permissions/{id}')
  @response(204, {
    description: 'Permission DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.permissionRepository.deleteById(id)
  }
}
