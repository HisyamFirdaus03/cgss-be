import { authenticate } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { get, getModelSchemaRef } from '@loopback/rest'
import { JwtStrategy, UserWithUagAndUserDetail } from '../../common'
import { RefreshTokenControllerUseCasesBindings, RefreshTokensController, UseRefreshTokenTokenOwner } from './module'

const { v1, controller } = RefreshTokensController

@authenticate(JwtStrategy.UserRefreshToken)
export class RefreshTokens_User_GetController {
  constructor(
    @inject(RefreshTokenControllerUseCasesBindings.v1.UseRefreshTokenTokenOwner)
    public v1_UseRefreshTokenTokenOwner: UseRefreshTokenTokenOwner.v1
  ) {}

  @get(v1.refresh_tokens.users.path, {
    'x-controller-name': controller,
    description: '**[`token`]** : ' + 'Get the owner of the refresh token. ' + 'Must provide a valid token in the request header.',
    responses: {
      '200': {
        description: '[`UserWithUagAndUserDetail`] : Refresh token owner',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUagAndUserDetail),
          },
        },
      },
    },
  })
  async [v1.refresh_tokens.users.get.fn](): Promise<UserWithUagAndUserDetail> {
    return this.v1_UseRefreshTokenTokenOwner.call()
  }
}
