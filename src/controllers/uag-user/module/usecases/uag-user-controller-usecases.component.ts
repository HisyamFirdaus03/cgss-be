import { Binding, Component } from '@loopback/core'
import {
  UseUagUserCreateUsr,
  UseUagUserFindUsrs,
  UseUagUserLinkUsr,
  UseUagUserReset,
  UseUagUserUnlinkUsr,
  UseUagUserUnlinkUsrs,
} from './providers'
import { UagUserControllerUseCasesBindings } from './uag-user-controller-usecases.bindings'

/**
 * Component
 */
export class UagUserControllerUseCasesComponent implements Component {
  bindings = [
    Binding.bind(UagUserControllerUseCasesBindings.v1.UseUagUserCreateUsr).toClass(UseUagUserCreateUsr.v1),
    Binding.bind(UagUserControllerUseCasesBindings.v1.UseUagUserFindUsrs).toClass(UseUagUserFindUsrs.v1),
    Binding.bind(UagUserControllerUseCasesBindings.v1.UseUagUserLinkUsr).toClass(UseUagUserLinkUsr.v1),
    Binding.bind(UagUserControllerUseCasesBindings.v1.UseUagUserUnlinkUsr).toClass(UseUagUserUnlinkUsr.v1),
    Binding.bind(UagUserControllerUseCasesBindings.v1.UseUagUserUnlinkUsrs).toClass(UseUagUserUnlinkUsrs.v1),
    Binding.bind(UagUserControllerUseCasesBindings.v1.UseUagUserReset).toClass(UseUagUserReset.v1),
  ]
}
