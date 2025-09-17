import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  AuthorizationRequest,
  Authorizer,
} from '@loopback/authorization'
import { Provider } from '@loopback/core'
import { repository } from '@loopback/repository'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { UserAccessGroup } from '../../../models'
import { UserRepository } from '../../../repositories'

import * as casbin from 'casbin'
import { Enforcer } from 'casbin'
import path from 'node:path'
import { UserAccessLevel } from '../types'
const conf = path.resolve(__dirname, '../../../../casbin/casbin_rbac_model.conf')
console.log({ conf, __dirname })

export class UserCasbinAuthorizerProvider implements Provider<Authorizer> {
  constructor(@repository(UserRepository) public userRepository: UserRepository) { }

  value(): Authorizer {
    return this.authorize.bind(this)
  }

  async authorize(authorizationCtx: AuthorizationContext, metadata: AuthorizationMetadata): Promise<AuthorizationDecision> {
    let allowedRoles = metadata.allowedRoles

    if (!allowedRoles) {
      allowedRoles = [UserAccessLevel.name.none]
    }

    if (allowedRoles.includes(UserAccessLevel.name.device) || allowedRoles.includes(UserAccessLevel.name.external)) {
      return AuthorizationDecision.ABSTAIN
    }

    const user = await authorizationCtx.invocationContext.get<UserProfile>(SecurityBindings.USER, { optional: true })

    // handle unauthenticated user
    if (!user) {
      for (const role of allowedRoles) {
        if (role === UserAccessLevel.name.anonymous) {
          return AuthorizationDecision.ALLOW
        }
      }

      return AuthorizationDecision.ABSTAIN
    }

    if (!allowedRoles.includes(UserAccessLevel.name.root)) {
      allowedRoles = [...allowedRoles, UserAccessLevel.name.root]
    }

    const resource = metadata.resource ?? authorizationCtx.resource
    const request: AuthorizationRequest = {
      subject: `u${user[securityId]}`,
      object: resource,
      action: metadata.scopes?.[0] ?? 'execute',
    }
    const enforcer = await this.createEnforcer(user, allowedRoles, resource, metadata.scopes)

    // const policy = await enforcer.getPolicy()
    // const groupingPolicy = await enforcer.getGroupingPolicy()
    // console.log(`request : \n${JSON.stringify(request, null, 4)}`)
    // console.log(`policy :`)
    // for (const p of policy) {
    //   console.log(` p,${p}`)
    // }
    // for (const g of groupingPolicy) {
    //   console.log(` g,${g}`)
    // }

    const allowedByRole = await enforcer.enforce(request.subject, request.object, request.action)
    if (allowedByRole) {
      return AuthorizationDecision.ALLOW
    }

    return AuthorizationDecision.ABSTAIN
  }

  async createEnforcer(user: UserProfile, allowedRoles: string[], resource?: string, scopes?: string[]): Promise<Enforcer> {
    const enforcer = await casbin.newEnforcer(conf)
    const action = scopes ? scopes[0] : 'execute'

    for (const sub of allowedRoles) {
      enforcer.addPolicy(sub, resource ?? '*', action)
    }
    if (!allowedRoles.includes(UserAccessLevel.name.root)) {
      enforcer.addPolicy(UserAccessLevel.name.root, resource ?? '*', action)
    }

    enforcer.addRoleForUser(`u${user[securityId]}`, UserAccessLevel.name.anonymous)
    const userAccessGroups = await this.userRepository.userAccessGroups(Number(user[securityId])).find()

    userAccessGroups.forEach((item) => {
      const rbac = item.toJSON() as UserAccessGroup
      enforcer.addRoleForUser(`u${user[securityId]}`, rbac.name)
    })
    return enforcer
  }
}
