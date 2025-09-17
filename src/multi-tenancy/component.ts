import { Binding, Component, createBindingFromClass, extensionFor } from '@loopback/core'
import { MultiTenancyBindings, MULTI_TENANCY_STRATEGIES } from './keys'
import { MultiTenancyMiddlewareProvider } from './middleware/multi-tenancy-middleware.provider'
import { HeaderStrategy } from './strategies'

export class MultiTenancyComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(MultiTenancyMiddlewareProvider, { key: MultiTenancyBindings.MIDDLEWARE }),
    createBindingFromClass(HeaderStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),

    // createBindingFromClass(JWTStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
    // createBindingFromClass(QueryStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
    // createBindingFromClass(HostStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
  ]
}
