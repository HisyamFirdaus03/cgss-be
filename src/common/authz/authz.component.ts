import { AuthorizationTags } from '@loopback/authorization'
import { Binding, Component } from '@loopback/core'
import {
  UserCasbinAuthorizerProvider,
  UserGroupIdAuthorizerProvider,
  UserGroupNameAuthorizerProvider,
  UserOwnerArg0AuthorizerProvider,
  UserPermissionAuthorizerProvider,
  UserRankArg0AuthorizerProvider,
} from './authorizers'
import { AuthzBindings } from './authz.bindings'

export class AuthzComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(AuthzBindings.Usr.Casbin).toProvider(UserCasbinAuthorizerProvider).tag(AuthorizationTags.AUTHORIZER),

    Binding.bind(AuthzBindings.Usr.Owner).toProvider(UserOwnerArg0AuthorizerProvider),

    Binding.bind(AuthzBindings.Usr.Rank).toProvider(UserRankArg0AuthorizerProvider),

    Binding.bind(AuthzBindings.Usr.GroupId).toProvider(UserGroupIdAuthorizerProvider),

    Binding.bind(AuthzBindings.Usr.GroupName).toProvider(UserGroupNameAuthorizerProvider),

    // Permission-based authorization
    Binding.bind(AuthzBindings.Usr.Permission).toProvider(UserPermissionAuthorizerProvider).tag(AuthorizationTags.AUTHORIZER),
  ]
}
