import { Authorizer } from '@loopback/authorization'
import { BindingKey } from '@loopback/core'

export namespace AuthzBindings {
  export namespace Usr {
    export const Casbin = BindingKey.create<Authorizer>('authz.user.casbin.authorizer')
    export const Owner = BindingKey.create<Authorizer>('authz.user.owner.authorizer')
    export const Rank = BindingKey.create<Authorizer>('authz.user.rank.authorizer')
    export const GroupId = BindingKey.create<Authorizer>('authz.user.uag-id.authorizer')
    export const GroupName = BindingKey.create<Authorizer>('authz.user.uag-name.authorizer')
    // export const GroupBy = BindingKey.create<Authorizer>('authz.user.group-by.authorizer')
    export const Permission = BindingKey.create<Authorizer>('authz.user.permission.authorizer')
  }
}
