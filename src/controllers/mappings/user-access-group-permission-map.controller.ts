import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { UserAccessGroupPermissionMap } from '../../models'
import { UserAccessGroupPermissionMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { JwtStrategy, UserAccessLevel } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class UserAccessGroupPermissionMapController {
	constructor(
		@repository(UserAccessGroupPermissionMapRepository)
		public userAccessGroupPermissionMapRepository: UserAccessGroupPermissionMapRepository
	) { }

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
	@post('/user-access-group-permission-map')
	@response(200, {
		description: 'UserAccessGroupPermissionMap model instance',
		content: { 'application/json': { schema: getModelSchemaRef(UserAccessGroupPermissionMap) } },
	})
	async create(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserAccessGroupPermissionMap, {
						title: 'NewUserAccessGroupPermissionMap',
						exclude: ['id'],
					}),
				},
			},
		})
		userAccessGroupPermissionMap: Omit<UserAccessGroupPermissionMap, 'id'>
	): Promise<UserAccessGroupPermissionMap> {
		return this.userAccessGroupPermissionMapRepository.create(userAccessGroupPermissionMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-access-group-permission-map/count')
	@response(200, {
		description: 'UserAccessGroupPermissionMap model count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async count(@param.where(UserAccessGroupPermissionMap) where?: Where<UserAccessGroupPermissionMap>): Promise<Count> {
		return this.userAccessGroupPermissionMapRepository.count(where)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-access-group-permission-map')
	@response(200, {
		description: 'Array of UserAccessGroupPermissionMap model instances',
		content: {
			'application/json': {
				schema: {
					type: 'array',
					items: getModelSchemaRef(UserAccessGroupPermissionMap, { includeRelations: true }),
				},
			},
		},
	})
	async find(@param.filter(UserAccessGroupPermissionMap) filter?: Filter<UserAccessGroupPermissionMap>): Promise<UserAccessGroupPermissionMap[]> {
		return this.userAccessGroupPermissionMapRepository.find({
			...filter,
			include: [
				{
					relation: 'userAccessGroup',
					scope: {
						fields: ['id', 'name', 'description']
					}
				},
				{
					relation: 'permission',
					scope: {
						fields: ['id', 'name', 'description']
					}
				}
			]
		})
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
	@patch('/user-access-group-permission-map')
	@response(200, {
		description: 'UserAccessGroupPermissionMap PATCH success count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async updateAll(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserAccessGroupPermissionMap, { partial: true }),
				},
			},
		})
		userAccessGroupPermissionMap: UserAccessGroupPermissionMap,
		@param.where(UserAccessGroupPermissionMap) where?: Where<UserAccessGroupPermissionMap>
	): Promise<Count> {
		return this.userAccessGroupPermissionMapRepository.updateAll(userAccessGroupPermissionMap, where)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-access-group-permission-map/{id}')
	@response(200, {
		description: 'UserAccessGroupPermissionMap model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(UserAccessGroupPermissionMap, { includeRelations: true }),
			},
		},
	})
	async findById(
		@param.path.number('id') id: number,
		@param.filter(UserAccessGroupPermissionMap, { exclude: 'where' }) filter?: FilterExcludingWhere<UserAccessGroupPermissionMap>
	): Promise<UserAccessGroupPermissionMap> {
		return this.userAccessGroupPermissionMapRepository.findById(id, filter)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
	@patch('/user-access-group-permission-map/{id}')
	@response(204, {
		description: 'UserAccessGroupPermissionMap PATCH success',
	})
	async updateById(
		@param.path.number('id') id: number,
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserAccessGroupPermissionMap, { partial: true }),
				},
			},
		})
		userAccessGroupPermissionMap: UserAccessGroupPermissionMap
	): Promise<void> {
		await this.userAccessGroupPermissionMapRepository.updateById(id, userAccessGroupPermissionMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
	@put('/user-access-group-permission-map/{id}')
	@response(204, {
		description: 'UserAccessGroupPermissionMap PUT success',
	})
	async replaceById(@param.path.number('id') id: number, @requestBody() userAccessGroupPermissionMap: UserAccessGroupPermissionMap): Promise<void> {
		await this.userAccessGroupPermissionMapRepository.replaceById(id, userAccessGroupPermissionMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem] })
	@del('/user-access-group-permission-map/{id}')
	@response(204, {
		description: 'UserAccessGroupPermissionMap DELETE success',
	})
	async deleteById(@param.path.number('id') id: number): Promise<void> {
		await this.userAccessGroupPermissionMapRepository.deleteById(id)
	}
}
