import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { Provider } from '@loopback/core'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { UserAccessLevel } from '../types'

export class UserOwnerArg0AuthorizerProvider implements Provider<Authorizer> {
  constructor() {}

  value(): Authorizer {
    return this.authorize.bind(this)
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata
  ): Promise<AuthorizationDecision> {
    if (metadata.allowedRoles?.includes(UserAccessLevel.name.owner_0)) {
      const resourceId = authorizationCtx.invocationContext.args[0]

      const user = await authorizationCtx.invocationContext.get<UserProfile>(SecurityBindings.USER, {
        optional: true,
      })
      if (!user) {
        return AuthorizationDecision.ABSTAIN
      }
      const userId = user[securityId]
      if (userId == resourceId) {
        return AuthorizationDecision.ALLOW
      }
    }
    return AuthorizationDecision.ABSTAIN
  }
}
