import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { inject, Provider } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { SecurityService, SecurityServiceBindings } from '../../security'
import { UserAccessLevel } from '../types'

export class UserGroupIdAuthorizerProvider implements Provider<Authorizer> {
  constructor(@inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1) {}

  value(): Authorizer {
    return this.authorize.bind(this)
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata
  ): Promise<AuthorizationDecision> {
    if (
      metadata.allowedRoles?.includes(UserAccessLevel.name.group_0) ||
      metadata.allowedRoles?.includes(UserAccessLevel.name.group_1)
    ) {
      let targetUagId
      if (metadata.allowedRoles?.includes(UserAccessLevel.name.group_0)) {
        targetUagId = authorizationCtx.invocationContext.args[0] as number
      } else if (metadata.allowedRoles?.includes(UserAccessLevel.name.group_1)) {
        targetUagId = authorizationCtx.invocationContext.args[1] as number
      } else {
        return AuthorizationDecision.ABSTAIN
      }

      const userProfile = await authorizationCtx.invocationContext.get<UserProfile>(SecurityBindings.USER, {
        optional: true,
      })
      if (!userProfile) {
        return AuthorizationDecision.ABSTAIN
      }

      const currentUserId = Number(userProfile[securityId])

      const level = await this.userSecurityService.getCurrentUserLowestAndTargetUagPriority(currentUserId, targetUagId)

      if (level.currentUserLowestUagPriority < level.targetUagPriority) {
        return AuthorizationDecision.ALLOW
      }
    }
    return AuthorizationDecision.ABSTAIN
  }
}
