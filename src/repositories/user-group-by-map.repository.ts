import { Getter, inject } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { HttpErrors } from '@loopback/rest'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { UserAccessLevel } from '../common/authz/types/user-access-level'
import { DatabaseConfig } from '../configurations/secrets'
import { DemoDataSource } from '../datasources'
import { GroupBy, User, UserAccessGroup, UserGroupByMap, UserGroupByMapRelations } from '../models'
import { GroupByRepository } from './group-by.repository'
import { UserAccessGroupMapRepository } from './user-access-group-map.repository'
import { UserAccessGroupRepository } from './user-access-group.repository'
import { UserRepository } from './user.repository'

export class UserGroupByMapRepository extends DefaultCrudRepository<
	UserGroupByMap,
	typeof UserGroupByMap.prototype.id,
	UserGroupByMapRelations
> {
	public readonly userRelation: BelongsToAccessor<User, typeof UserGroupByMap.prototype.id>
	public readonly groupBy: BelongsToAccessor<GroupBy, typeof UserGroupByMap.prototype.id>

	constructor(
		@inject(SecurityBindings.USER, { optional: true }) private user: UserProfile | undefined,
		@inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
		@repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
		@repository.getter('GroupByRepository') protected groupByRepositoryGetter: Getter<GroupByRepository>,
		@repository.getter('UserAccessGroupMapRepository') protected userAccessGroupMapRepositoryGetter: Getter<UserAccessGroupMapRepository>,
		@repository.getter('UserAccessGroupRepository') protected userAccessGroupRepositoryGetter: Getter<UserAccessGroupRepository>,
	) {
		super(UserGroupByMap, dataSource)
		this.userRelation = this.createBelongsToAccessorFor('user', userRepositoryGetter)
		this.registerInclusionResolver('user', this.userRelation.inclusionResolver)

		this.groupBy = this.createBelongsToAccessorFor('groupBy', groupByRepositoryGetter)
		this.registerInclusionResolver('groupBy', this.groupBy.inclusionResolver)
	}

	private async getCurrentUserGroupByIds(): Promise<number[]> {
		const userId = +this.user![securityId]
		const mappings = await this.find({ where: { userId } })

		return mappings.map((m) => m.groupById!)
	}

	private async getUserAccessGroupWithLowestPriority(): Promise<UserAccessGroup | null> {
		const userId = +this.user![securityId]

		// Get user access group mappings
		const userAccessGroupMapRepo = await this.userAccessGroupMapRepositoryGetter()
		const accessGroupMappings = await userAccessGroupMapRepo.find({ where: { userId } })

		if (accessGroupMappings.length === 0) return null

		const accessGroupIds = accessGroupMappings.map(mapping => mapping.accessGroupId)

		// Get access groups and find the one with lowest priority
		const userAccessGroupRepo = await this.userAccessGroupRepositoryGetter()
		const accessGroups = await userAccessGroupRepo.find({
			where: { id: { inq: accessGroupIds } },
			order: ['priority ASC'],
		})

		return accessGroups.length > 0 ? accessGroups[0] : null
	}

	async validateGroupByAccess(requiredGroupByIds: number[]): Promise<void> {
		// During migrations or when no user context is available, skip validation
		if (!this.user) return

		const accessGroup = await this.getUserAccessGroupWithLowestPriority()
		if ((accessGroup?.priority ?? UserAccessLevel.priority.none) <= UserAccessLevel.priority.adminCompany) return

		const userGroupByIds = await this.getCurrentUserGroupByIds()
		const hasAccess = requiredGroupByIds.every(groupById => userGroupByIds.includes(groupById))

		if (!hasAccess) {
			throw new HttpErrors[403]('Inaccessible Group')
		}
	}
}
