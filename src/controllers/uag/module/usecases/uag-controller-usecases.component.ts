import { Binding, Component } from '@loopback/core'
import { UseUagGetManagedUags } from './providers'
import { UagControllerUseCasesBindings } from './uag-controller-usecases.bindings'

// Component
export class UagControllerUseCasesComponent implements Component {
  bindings = [Binding.bind(UagControllerUseCasesBindings.v1.UseUagGetManagedUags).toClass(UseUagGetManagedUags.v1)]
}
