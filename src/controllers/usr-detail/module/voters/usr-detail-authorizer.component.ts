import { Binding, Component } from '@loopback/core'
import { UserDetailRankAuthorizerProvider, UsrDetailOwnerAuthorizerProvider } from './authorizers'
import { UsrDetailAuthorizerBindings } from './usr-detail-authorizer.bindings'

export class UsrDetailAuthorizerComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(UsrDetailAuthorizerBindings.Owner).toProvider(UsrDetailOwnerAuthorizerProvider),

    Binding.bind(UsrDetailAuthorizerBindings.Rank).toProvider(UserDetailRankAuthorizerProvider),
  ]
}
