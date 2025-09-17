import { Binding, Component } from '@loopback/core'
import {
  UseUserUagFind,
  UseUserUagLinkByUagId,
  UseUserUagLinkByUagName,
  UseUserUagUnlinkAllByUagName,
  UseUserUagUnlinkByUagId,
  UseUserUagUnlinkByUagName,
} from './providers'
import { UserUagControllerUseCasesBindings } from './user-uag-controller-usecases.bindings'

export class UserUagControllerUseCasesComponent implements Component {
  bindings = [
    Binding.bind(UserUagControllerUseCasesBindings.v1.UseUserUagUnlinkByUagName).toClass(UseUserUagUnlinkByUagName.v1),

    Binding.bind(UserUagControllerUseCasesBindings.v1.UseUserUagLinkByUagName).toClass(UseUserUagLinkByUagName.v1),

    Binding.bind(UserUagControllerUseCasesBindings.v1.UseUserUagUnlinkAllByUagName).toClass(
      UseUserUagUnlinkAllByUagName.v1
    ),

    Binding.bind(UserUagControllerUseCasesBindings.v1.UseUserUagFind).toClass(UseUserUagFind.v1),

    Binding.bind(UserUagControllerUseCasesBindings.v1.UseUserUagLinkByUagId).toClass(UseUserUagLinkByUagId.v1),

    Binding.bind(UserUagControllerUseCasesBindings.v1.UseUserUagUnlinkByUagId).toClass(UseUserUagUnlinkByUagId.v1),
  ]
}
