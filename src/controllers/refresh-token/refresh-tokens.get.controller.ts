import { authenticate } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { get, getModelSchemaRef } from '@loopback/rest'
import { JwtStrategy, UserWithLoginSession } from '../../common'
import { RefreshTokenControllerUseCasesBindings, RefreshTokensController, UseRefreshTokenRefreshedAccessToken } from './module'

const { v1, controller } = RefreshTokensController

@authenticate(JwtStrategy.UserRefreshToken)
export class RefreshTokens_GetController {
  constructor(
    @inject(RefreshTokenControllerUseCasesBindings.v1.UseRefreshTokenRefreshedAccessToken)
    public v1_UseRefreshTokenRefreshedAccessToken: UseRefreshTokenRefreshedAccessToken.v1
  ) {}

  @get(v1.refresh_tokens.path, {
    'x-controller-name': controller,
    description: '**[`token`]** : ' + 'Get a new access token / refresh token pair. ' + 'Must provide a valid token in the request header.',
    responses: {
      '200': {
        description: '`[UserWithLoginSession]` : New Tokens and user profile',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithLoginSession),
          },
        },
      },
    },
  })
  async [v1.refresh_tokens.get.fn](): Promise<UserWithLoginSession> {
    // we are using this in FE
    return this.v1_UseRefreshTokenRefreshedAccessToken.call()
  }
}
