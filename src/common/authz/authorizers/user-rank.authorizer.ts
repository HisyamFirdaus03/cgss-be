import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { inject, Provider } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { SecurityService, SecurityServiceBindings } from '../../security'
import { UserAccessLevel } from '../types'

export class UserRankArg0AuthorizerProvider implements Provider<Authorizer> {
  constructor(@inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1) {}

  value(): Authorizer {
    return this.authorize.bind(this)
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata
  ): Promise<AuthorizationDecision> {
    if (metadata.allowedRoles?.includes(UserAccessLevel.name.rank_0)) {
      const targetUserId = authorizationCtx.invocationContext.args[0]

      const userProfile = await authorizationCtx.invocationContext.get<UserProfile>(SecurityBindings.USER, {
        optional: true,
      })
      if (!userProfile) {
        return AuthorizationDecision.ABSTAIN
      }

      const currentUserId = Number(userProfile[securityId])

      const ranking = await this.userSecurityService.getCurrentUserAndTargetUserLowestUagPriority(
        currentUserId,
        targetUserId
      )

      if (ranking.currentUserLowestUagPriority < ranking.targetUserLowestUagPriority) {
        return AuthorizationDecision.ALLOW
      }
    }
    return AuthorizationDecision.ABSTAIN
  }
}
