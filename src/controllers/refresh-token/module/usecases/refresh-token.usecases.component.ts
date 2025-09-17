import { Binding, Component } from '@loopback/core'
import { UseRefreshTokenRefreshedAccessToken, UseRefreshTokenTokenOwner } from './providers'
import { RefreshTokenControllerUseCasesBindings } from './refresh-token-controller-usecases.bindings'

// Component
export class RefreshControllerTokenUseCasesComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(RefreshTokenControllerUseCasesBindings.v1.UseRefreshTokenTokenOwner).toClass(
      UseRefreshTokenTokenOwner.v1
    ),
    Binding.bind(RefreshTokenControllerUseCasesBindings.v1.UseRefreshTokenRefreshedAccessToken).toClass(
      UseRefreshTokenRefreshedAccessToken.v1
    ),
  ]
}
