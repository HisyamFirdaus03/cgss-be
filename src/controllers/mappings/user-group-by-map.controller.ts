import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { UserGroupByMap } from '../../models'
import { UserGroupByMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { JwtStrategy, UserAccessLevel } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class UserGroupByMapController {
	constructor(
		@repository(UserGroupByMapRepository)
		public userGroupByMapRepository: UserGroupByMapRepository
	) { }

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@post('/user-group-by-map')
	@response(200, {
		description: 'UserGroupByMap model instance',
		content: { 'application/json': { schema: getModelSchemaRef(UserGroupByMap) } },
	})
	async create(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserGroupByMap, {
						title: 'NewUserGroupByMap',
						exclude: ['id'],
					}),
				},
			},
		})
		userGroupByMap: Omit<UserGroupByMap, 'id'>
	): Promise<UserGroupByMap> {
		return this.userGroupByMapRepository.create(userGroupByMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-group-by-map/count')
	@response(200, {
		description: 'UserGroupByMap model count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async count(@param.where(UserGroupByMap) where?: Where<UserGroupByMap>): Promise<Count> {
		return this.userGroupByMapRepository.count(where)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-group-by-map')
	@response(200, {
		description: 'Array of UserGroupByMap model instances',
		content: {
			'application/json': {
				schema: {
					type: 'array',
					items: getModelSchemaRef(UserGroupByMap, { includeRelations: true }),
				},
			},
		},
	})
	async find(@param.filter(UserGroupByMap) filter?: Filter<UserGroupByMap>): Promise<UserGroupByMap[]> {
		return this.userGroupByMapRepository.find({
			...filter,
			include: [
				{
					relation: 'user',
					scope: {
						fields: ['id', 'name', 'email']
					}
				},
				{
					relation: 'groupBy',
					scope: {
						fields: ['id', 'name']
					}
				}
			]
		})
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@patch('/user-group-by-map')
	@response(200, {
		description: 'UserGroupByMap PATCH success count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async updateAll(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserGroupByMap, { partial: true }),
				},
			},
		})
		userGroupByMap: UserGroupByMap,
		@param.where(UserGroupByMap) where?: Where<UserGroupByMap>
	): Promise<Count> {
		return this.userGroupByMapRepository.updateAll(userGroupByMap, where)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-group-by-map/{id}')
	@response(200, {
		description: 'UserGroupByMap model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(UserGroupByMap, { includeRelations: true }),
			},
		},
	})
	async findById(
		@param.path.number('id') id: number,
		@param.filter(UserGroupByMap, { exclude: 'where' }) filter?: FilterExcludingWhere<UserGroupByMap>
	): Promise<UserGroupByMap> {
		return this.userGroupByMapRepository.findById(id, filter)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@patch('/user-group-by-map/{id}')
	@response(204, {
		description: 'UserGroupByMap PATCH success',
	})
	async updateById(
		@param.path.number('id') id: number,
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserGroupByMap, { partial: true }),
				},
			},
		})
		userGroupByMap: UserGroupByMap
	): Promise<void> {
		await this.userGroupByMapRepository.updateById(id, userGroupByMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@put('/user-group-by-map/{id}')
	@response(204, {
		description: 'UserGroupByMap PUT success',
	})
	async replaceById(@param.path.number('id') id: number, @requestBody() userGroupByMap: UserGroupByMap): Promise<void> {
		await this.userGroupByMapRepository.replaceById(id, userGroupByMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@del('/user-group-by-map/{id}')
	@response(204, {
		description: 'UserGroupByMap DELETE success',
	})
	async deleteById(@param.path.number('id') id: number): Promise<void> {
		await this.userGroupByMapRepository.deleteById(id)
	}
}
