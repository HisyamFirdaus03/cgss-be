import { BindingKey } from '@loopback/core'
import { Count, Filter, Where } from '@loopback/repository'
import {
  UserLogout,
  UserPatch,
  UserWhere,
  UserWithLoginSession,
  UserWithUagAndUserDetail,
  UserWithUagAndUserDetailPagedUser,
  UserWithUserDetail,
  WebLoginCredential,
} from '../../../../common'
import { UseCase } from '../../../../common'
import { UserFilter } from '../../../../common/types/arguments/user-filter'
import { User } from '../../../../models'

/**
 * Bindings
 */
export namespace UserControllerUseCasesBindings {
  export namespace v1 {
    export const UseUserLogin =
      BindingKey.create<UseCase<WebLoginCredential, UserWithLoginSession>>('v1.user-use-case.login')

    export const UseUserLogout = BindingKey.create<UseCase<void, UserLogout | null>>('v1.user-use-case.logout')

    export const UseUserCount = BindingKey.create<UseCase<Where<User>, Count>>('v1.user-use-case.count')

    export const UseUserRequestEmailVerificationByCred = BindingKey.create<UseCase<WebLoginCredential, string>>(
      'v1.user-use-case.request-email-verification-by-cred'
    )

    export const UseUserVerifyEmailByToken = BindingKey.create<UseCase<void, string>>(
      'v1.user-use-case.verify-email-by-token'
    )

    export const UseUserRequestResetPassword = BindingKey.create<UseCase<{ usernameOrEmail: string }, string>>(
      'v1.user-use-case.request-reset-password'
    )

    export const UseUserResetPasswordByToken = BindingKey.create<UseCase<{ password: string }, string>>(
      'v1.user-use-case.reset-password-by-token'
    )

    export const UseUserDeactivate =
      BindingKey.create<UseCase<number, UserWithUserDetail>>('v1.user-use-case.deactivate')

    export const UseUserReactivate =
      BindingKey.create<UseCase<number, UserWithUserDetail>>('v1.user-use-case.reactivate')

    export const UseUserRequestEmailVerificationById = BindingKey.create<UseCase<number, string>>(
      'v1.user-use-case.request-email-verification-by-id'
    )

    export const UseUserResetPasswordById = BindingKey.create<UseCase<{ userId: number; password: string }, string>>(
      'v1.user-use-case.reset-password-by-id'
    )

    export const UseUserVerifyEmailById = BindingKey.create<UseCase<number, string>>(
      'v1.user-use-case.verify-email-by-id'
    )

    export const UseUserUpdateById = BindingKey.create<UseCase<UserPatch, UserWithUserDetail>>(
      'v1.user-use-case.update-by-id'
    )

    export const UseUserFindById = BindingKey.create<UseCase<UserFilter, User>>('v1.user-use-case.find-by-id')

    export const UseUserDeleteById = BindingKey.create<UseCase<number, UserWithUagAndUserDetail>>(
      'v1.user-use-case.delete-by-id'
    )

    export const UseUserFind =
      BindingKey.create<UseCase<Filter<User>, UserWithUagAndUserDetailPagedUser>>('v1.user-use-case.find')

    export const UseUserUpdate = BindingKey.create<UseCase<UserWhere, Count>>('v1.user-use-case.update')
  }
}
