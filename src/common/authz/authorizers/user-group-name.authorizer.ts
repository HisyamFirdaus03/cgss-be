import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { inject, Provider } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { SecurityService, SecurityServiceBindings } from '../../security'
import { UserAccessLevel } from '../types'

export class UserGroupNameAuthorizerProvider implements Provider<Authorizer> {
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
      let targetUagName
      if (metadata.allowedRoles?.includes(UserAccessLevel.name.group_0)) {
        targetUagName = authorizationCtx.invocationContext.args[0] as string
      } else if (metadata.allowedRoles?.includes(UserAccessLevel.name.group_1)) {
        targetUagName = authorizationCtx.invocationContext.args[1] as string
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

      const level = await this.userSecurityService.getCurrentUserLowestAndTargetUagPriority(
        currentUserId,
        targetUagName
      )

      if (level.currentUserLowestUagPriority < level.targetUagPriority) {
        return AuthorizationDecision.ALLOW
      }
    }
    return AuthorizationDecision.ABSTAIN
  }
}
