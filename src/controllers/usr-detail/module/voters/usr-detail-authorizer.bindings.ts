import { Authorizer } from '@loopback/authorization'
import { BindingKey } from '@loopback/core'

export namespace UsrDetailAuthorizerBindings {
  export const Owner = BindingKey.create<Authorizer>('authz.user.user-detail.owner.authorizer')
  export const Rank = BindingKey.create<Authorizer>('authz.user.user-detail.rank.authorizer')
}
