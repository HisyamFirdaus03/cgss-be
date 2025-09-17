import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { inject, Provider } from '@loopback/core'
import { repository } from '@loopback/repository'
import { HttpErrors } from '@loopback/rest'
import { securityId } from '@loopback/security'
import { SecurityService, SecurityServiceBindings, UserAccessLevel } from '../../../../../common'
import { UserDetailRepository } from '../../../../../repositories'

export class UserDetailRankAuthorizerProvider implements Provider<Authorizer> {
  constructor(
    @inject(SecurityServiceBindings.Usr.v1)
    private userSecurityService: SecurityService.Usr.v1,
    @repository(UserDetailRepository)
    private userDetailRepository: UserDetailRepository
  ) {}

  value(): Authorizer {
    return this.authorize.bind(this)
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata
  ): Promise<AuthorizationDecision> {
    if (!metadata.allowedRoles) {
      return AuthorizationDecision.ABSTAIN
    }
    if (!metadata.allowedRoles.includes(UserAccessLevel.name.rank_0)) {
      return AuthorizationDecision.ABSTAIN
    }

    if (authorizationCtx.principals.length > 0) {
      const currentUserId = Number(authorizationCtx.principals[0][securityId])

      let userDetailId
      if (authorizationCtx.invocationContext.args?.length > 0) {
        userDetailId = authorizationCtx.invocationContext.args[0]
      }
      if (!userDetailId) {
        throw new HttpErrors[403]('Missing resource ID')
      }
      const userDetailOwner = await this.userDetailRepository.user(userDetailId)
      if (!userDetailOwner) {
        throw new HttpErrors[403]('Resource not found')
      }

      const ranking = await this.userSecurityService.getCurrentUserAndTargetUserLowestUagPriority(
        currentUserId,
        userDetailOwner.id!
      )
      if (ranking.currentUserLowestUagPriority < ranking.targetUserLowestUagPriority) {
        return AuthorizationDecision.ALLOW
      }

      return AuthorizationDecision.ABSTAIN
    } else {
      return AuthorizationDecision.ABSTAIN
    }
  }
}
