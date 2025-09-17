import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { Provider } from '@loopback/core'
import { repository } from '@loopback/repository'
import { securityId } from '@loopback/security'
import { UserAccessLevel } from '../../../../../common'
import { UserDetailRepository } from '../../../../../repositories'

export class UsrDetailOwnerAuthorizerProvider implements Provider<Authorizer> {
  constructor(
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
    if (!metadata.allowedRoles.includes(UserAccessLevel.name.owner_0)) {
      return AuthorizationDecision.ABSTAIN
    }
    if (authorizationCtx.principals.length > 0) {
      const currentUserId = Number(authorizationCtx.principals[0][securityId])
      let userDetailId
      if (authorizationCtx.invocationContext.args?.length > 0) {
        userDetailId = authorizationCtx.invocationContext.args[0]
      }
      const count = await this.userDetailRepository.count({
        and: [{ id: userDetailId }, { userId: currentUserId }],
      })
      if (count.count == 1) {
        return AuthorizationDecision.ALLOW
      }

      return AuthorizationDecision.ABSTAIN
    } else {
      return AuthorizationDecision.ABSTAIN
    }
  }
}
