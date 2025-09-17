import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { Provider } from '@loopback/core'
import { repository } from '@loopback/repository'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { UserRepository } from '../../../repositories'
import { UserAccessLevel } from '../types'

export class UserPermissionAuthorizerProvider implements Provider<Authorizer> {
  constructor(
    @repository(UserRepository) private userRepository: UserRepository,
  ) {
  }

  value(): Authorizer {
    return this.authorize.bind(this)
  }

  async authorize(authorizationCtx: AuthorizationContext, metadata: AuthorizationMetadata): Promise<AuthorizationDecision> {
    const userProfile = await authorizationCtx.invocationContext.get<UserProfile>(SecurityBindings.USER, { optional: true })
    if (!userProfile) return AuthorizationDecision.ABSTAIN

    const currentUserId = Number(userProfile[securityId])

    // Get required permission from metadata.scopes or metadata.resource
    const requiredPermission = metadata.scopes?.[0] || metadata.resource
    if (!requiredPermission) return AuthorizationDecision.ABSTAIN

    // Get user with their permissions and access groups
    const user = await this.userRepository.findById(currentUserId, {
      include: [
        {
          relation: 'userAccessGroups',
          scope: {
            include: [
              {
                relation: 'permissions',
                scope: { fields: ['name'] },
              },
            ],
          },
        },
      ],
    })

    if (!user.userAccessGroups) return AuthorizationDecision.DENY

    // Check if user is root or admin-system (they have all permissions)
    const userRoles = user.userAccessGroups.map(group => group.name)
    // if ([
    //   UserAccessLevel.name.root,
    //   UserAccessLevel.name.adminSystem,
    //   UserAccessLevel.name.adminSystem,
    // ])
    if (userRoles.includes(UserAccessLevel.name.root) || userRoles.includes(UserAccessLevel.name.adminSystem)) {
      return AuthorizationDecision.ALLOW
    }

    // Collect all permissions from all user access groups
    const userPermissions = user.userAccessGroups.flatMap(group =>
      (group.permissions || []).map(permission => permission.name),
    )

    // Check if user has the required permission
    if (userPermissions.includes(requiredPermission)) {
      return AuthorizationDecision.ALLOW
    }

    return AuthorizationDecision.DENY
  }
}
