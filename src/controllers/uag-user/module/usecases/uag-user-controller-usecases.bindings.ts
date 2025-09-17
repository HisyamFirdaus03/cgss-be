import { BindingKey } from '@loopback/core'
import { Count } from '@loopback/repository'
import {
  UagIdentifier,
  UagsUsersUsersFilter,
  UagUser,
  UseCase,
  UserWithUserDetail,
  UserWithUserDetailModel,
  UserWithUserDetailPagedUser,
} from '../../../../common'

/**
 * Bindings
 */
export namespace UagUserControllerUseCasesBindings {
  export namespace v1 {
    export const UseUagUserCreateUsr = BindingKey.create<UseCase<UserWithUserDetailModel, UserWithUserDetail>>(
      'v1.use.case.uag-user.create.user'
    )

    export const UseUagUserFindUsrs = BindingKey.create<UseCase<UagsUsersUsersFilter, UserWithUserDetailPagedUser>>(
      'v1.use.case.uag-user.find.users'
    )

    export const UseUagUserLinkUsr = BindingKey.create<UseCase<UagUser, UserWithUserDetail>>(
      'v1.use.case.uag-user.link.user'
    )

    export const UseUagUserUnlinkUsr = BindingKey.create<UseCase<UagUser, UserWithUserDetail>>(
      'v1.use.case.uag-user.unlink.user'
    )

    export const UseUagUserUnlinkUsrs = BindingKey.create<UseCase<UagIdentifier, Count>>(
      'v1.use.case.uag-user.unlink.users'
    )

    export const UseUagUserReset = BindingKey.create<UseCase<void, Count>>('v1.use.case.uag-user.reset')
  }
}
