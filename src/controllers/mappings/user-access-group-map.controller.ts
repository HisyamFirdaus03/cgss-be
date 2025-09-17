import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest'
import { UserAccessGroupMap } from '../../models'
import { UserAccessGroupMapRepository } from '../../repositories'
import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { JwtStrategy, UserAccessLevel } from '../../common'

@authenticate(JwtStrategy.UserAccessToken)
export class UserAccessGroupMapController {
	constructor(
		@repository(UserAccessGroupMapRepository)
		public userAccessGroupMapRepository: UserAccessGroupMapRepository
	) { }

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@post('/user-access-group-map')
	@response(200, {
		description: 'UserAccessGroupMap model instance',
		content: { 'application/json': { schema: getModelSchemaRef(UserAccessGroupMap) } },
	})
	async create(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserAccessGroupMap, {
						title: 'NewUserAccessGroupMap',
						exclude: ['id'],
					}),
				},
			},
		})
		userAccessGroupMap: Omit<UserAccessGroupMap, 'id'>
	): Promise<UserAccessGroupMap> {
		return this.userAccessGroupMapRepository.create(userAccessGroupMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-access-group-map/count')
	@response(200, {
		description: 'UserAccessGroupMap model count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async count(@param.where(UserAccessGroupMap) where?: Where<UserAccessGroupMap>): Promise<Count> {
		return this.userAccessGroupMapRepository.count(where)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-access-group-map')
	@response(200, {
		description: 'Array of UserAccessGroupMap model instances',
		content: {
			'application/json': {
				schema: {
					type: 'array',
					items: getModelSchemaRef(UserAccessGroupMap, { includeRelations: true }),
				},
			},
		},
	})
	async find(@param.filter(UserAccessGroupMap) filter?: Filter<UserAccessGroupMap>): Promise<UserAccessGroupMap[]> {
		return this.userAccessGroupMapRepository.find({
			...filter,
			include: [
				{
					relation: 'user',
					scope: {
						fields: ['id', 'name', 'email']
					}
				},
				{
					relation: 'userAccessGroup',
					scope: {
						fields: ['id', 'name', 'description']
					}
				}
			]
		})
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@patch('/user-access-group-map')
	@response(200, {
		description: 'UserAccessGroupMap PATCH success count',
		content: { 'application/json': { schema: CountSchema } },
	})
	async updateAll(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserAccessGroupMap, { partial: true }),
				},
			},
		})
		userAccessGroupMap: UserAccessGroupMap,
		@param.where(UserAccessGroupMap) where?: Where<UserAccessGroupMap>
	): Promise<Count> {
		return this.userAccessGroupMapRepository.updateAll(userAccessGroupMap, where)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@get('/user-access-group-map/{id}')
	@response(200, {
		description: 'UserAccessGroupMap model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(UserAccessGroupMap, { includeRelations: true }),
			},
		},
	})
	async findById(
		@param.path.number('id') id: number,
		@param.filter(UserAccessGroupMap, { exclude: 'where' }) filter?: FilterExcludingWhere<UserAccessGroupMap>
	): Promise<UserAccessGroupMap> {
		return this.userAccessGroupMapRepository.findById(id, filter)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@patch('/user-access-group-map/{id}')
	@response(204, {
		description: 'UserAccessGroupMap PATCH success',
	})
	async updateById(
		@param.path.number('id') id: number,
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(UserAccessGroupMap, { partial: true }),
				},
			},
		})
		userAccessGroupMap: UserAccessGroupMap
	): Promise<void> {
		await this.userAccessGroupMapRepository.updateById(id, userAccessGroupMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@put('/user-access-group-map/{id}')
	@response(204, {
		description: 'UserAccessGroupMap PUT success',
	})
	async replaceById(@param.path.number('id') id: number, @requestBody() userAccessGroupMap: UserAccessGroupMap): Promise<void> {
		await this.userAccessGroupMapRepository.replaceById(id, userAccessGroupMap)
	}

	@authorize({ allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.adminCompany] })
	@del('/user-access-group-map/{id}')
	@response(204, {
		description: 'UserAccessGroupMap DELETE success',
	})
	async deleteById(@param.path.number('id') id: number): Promise<void> {
		await this.userAccessGroupMapRepository.deleteById(id)
	}
}
