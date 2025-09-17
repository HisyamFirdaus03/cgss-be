import { Binding, Component } from '@loopback/core'
import {
  UseUserCount,
  UseUserDeactive,
  UseUserDeleteById,
  UseUserFind,
  UseUserLogin,
  UseUserLogout,
  UseUserReactivate,
  UseUserRequestEmailVerificationByCred,
  UseUserRequestEmailVerificationById,
  UseUserRequestResetPassword,
  UseUserResetPasswordById,
  UseUserResetPasswordByToken,
  UseUserUpdate,
  UseUserUpdateById,
  UseVerifyEmailById,
  UseVerifyEmailByToken,
} from './providers'
import { UseUserFindById } from './providers/use-user-find-by-id'
import { UserControllerUseCasesBindings } from './user-controller-usecases.bindings'

/**
 * Component
 */
export class UserControllerUseCasesComponent implements Component {
  bindings = [
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserLogin).toClass(UseUserLogin.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserLogout).toClass(UseUserLogout.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserCount).toClass(UseUserCount.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserRequestEmailVerificationByCred).toClass(
      UseUserRequestEmailVerificationByCred.v1
    ),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserVerifyEmailByToken).toClass(UseVerifyEmailByToken.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserRequestResetPassword).toClass(UseUserRequestResetPassword.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserResetPasswordByToken).toClass(UseUserResetPasswordByToken.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserDeactivate).toClass(UseUserDeactive.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserReactivate).toClass(UseUserReactivate.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserRequestEmailVerificationById).toClass(
      UseUserRequestEmailVerificationById.v1
    ),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserResetPasswordById).toClass(UseUserResetPasswordById.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserVerifyEmailById).toClass(UseVerifyEmailById.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserUpdateById).toClass(UseUserUpdateById.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserFindById).toClass(UseUserFindById.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserDeleteById).toClass(UseUserDeleteById.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserFind).toClass(UseUserFind.v1),
    Binding.bind(UserControllerUseCasesBindings.v1.UseUserUpdate).toClass(UseUserUpdate.v1),
  ]
}
