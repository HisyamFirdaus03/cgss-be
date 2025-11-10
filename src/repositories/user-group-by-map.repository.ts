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

	async validateGroupByAccess(requiredGroupByIds: number[], isWriteOperation: boolean = true): Promise<void> {
		// During migrations or when no user context is available, skip validation
		if (!this.user) return

		const accessGroup = await this.getUserAccessGroupWithLowestPriority()
		const priority = accessGroup?.priority ?? UserAccessLevel.priority.none

		// Superadmin (GHG Gate) and Root bypass all checks
		if (priority <= UserAccessLevel.priority.adminGHGGate) return

		// Admin System and Admin Company have full access
		if (priority <= UserAccessLevel.priority.adminCompany) return

		// Get GroupByRepository for hierarchy queries
		const groupByRepo = await this.groupByRepositoryGetter()
		const userGroupByIds = await this.getCurrentUserGroupByIds()

		// Admin HQ: Can view all descendants, edit own and descendants
		if (priority === UserAccessLevel.priority.adminHQ) {
			for (const requiredId of requiredGroupByIds) {
				// Check if user has direct access to this group
				if (userGroupByIds.includes(requiredId)) continue

				// Check if any of user's groups is an ancestor of the required group
				const ancestors = await groupByRepo.getAncestorIds(requiredId)
				const hasAncestorAccess = ancestors.some(ancestorId => userGroupByIds.includes(ancestorId))

				if (!hasAncestorAccess) {
					throw new HttpErrors[403]('Inaccessible Group - Admin HQ can only access own HQ and descendants')
				}
			}
			return
		}

		// Admin Subsidiary: Can only access own subsidiary (no siblings, no descendants of siblings)
		if (priority === UserAccessLevel.priority.adminSubsidiary) {
			for (const requiredId of requiredGroupByIds) {
				// Check if user has direct access to this group
				if (userGroupByIds.includes(requiredId)) continue

				// Check if any of user's groups is an ancestor of the required group
				let hasDescendantAccess = false
				for (const userGroupId of userGroupByIds) {
					const descendants = await groupByRepo.getDescendantIds(userGroupId)
					if (descendants.includes(requiredId)) {
						hasDescendantAccess = true
						break
					}
				}

				if (!hasDescendantAccess) {
					throw new HttpErrors[403]('Inaccessible Group - Subsidiary Admin can only access own subsidiary and its children')
				}
			}
			return
		}

		// Guest: Read-only access to assigned tenant
		if (priority === UserAccessLevel.priority.guest) {
			if (isWriteOperation) {
				throw new HttpErrors[403]('Guest users have read-only access')
			}

			// Check if guest has access to the root HQ of the requested group
			for (const requiredId of requiredGroupByIds) {
				const rootHQ = await groupByRepo.getRootHQ(requiredId)

				// Check if user has access to this root HQ or any of its descendants
				let hasRootAccess = false
				for (const userGroupId of userGroupByIds) {
					const userRootHQ = await groupByRepo.getRootHQ(userGroupId)
					if (userRootHQ.id === rootHQ.id) {
						hasRootAccess = true
						break
					}
				}

				if (!hasRootAccess) {
					throw new HttpErrors[403]('Inaccessible Group - Guest can only view assigned tenant')
				}
			}
			return
		}

		// Member and other roles: Standard access (exact match only)
		const hasAccess = requiredGroupByIds.every(groupById => userGroupByIds.includes(groupById))

		if (!hasAccess) {
			throw new HttpErrors[403]('Inaccessible Group')
		}
	}

	/**
	 * Get all group IDs that the current user can access (including descendants for HQ admins)
	 * This is used for filtering lists of emissions/data
	 */
	async getAccessibleGroupIds(): Promise<number[]> {
		if (!this.user) return []

		const accessGroup = await this.getUserAccessGroupWithLowestPriority()
		const priority = accessGroup?.priority ?? UserAccessLevel.priority.none

		// Superadmin, Admin System, Admin Company have access to all groups
		if (priority <= UserAccessLevel.priority.adminCompany) {
			const groupByRepo = await this.groupByRepositoryGetter()
			const allGroups = await groupByRepo.find({ fields: ['id'] })
			return allGroups.map(g => g.id!)
		}

		const userGroupByIds = await this.getCurrentUserGroupByIds()
		const groupByRepo = await this.groupByRepositoryGetter()

		// Admin HQ: User's groups + all descendants
		if (priority === UserAccessLevel.priority.adminHQ) {
			const accessibleIds = new Set(userGroupByIds)

			for (const groupId of userGroupByIds) {
				const descendants = await groupByRepo.getDescendantIds(groupId)
				descendants.forEach(id => accessibleIds.add(id))
			}

			return Array.from(accessibleIds)
		}

		// Admin Subsidiary: User's groups + descendants of user's groups
		if (priority === UserAccessLevel.priority.adminSubsidiary) {
			const accessibleIds = new Set(userGroupByIds)

			for (const groupId of userGroupByIds) {
				const descendants = await groupByRepo.getDescendantIds(groupId)
				descendants.forEach(id => accessibleIds.add(id))
			}

			return Array.from(accessibleIds)
		}

		// Guest: All groups within the same root HQ
		if (priority === UserAccessLevel.priority.guest) {
			const accessibleIds = new Set<number>()

			for (const groupId of userGroupByIds) {
				const rootHQ = await groupByRepo.getRootHQ(groupId)
				accessibleIds.add(rootHQ.id!)

				const descendants = await groupByRepo.getDescendantIds(rootHQ.id!)
				descendants.forEach(id => accessibleIds.add(id))
			}

			return Array.from(accessibleIds)
		}

		// Member and other roles: Only exact matches
		return userGroupByIds
	}
}
