import { AuthenticationStrategy } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { HttpErrors } from '@loopback/rest'
import { SecurityService, SecurityServiceBindings } from '../../../security'
import { JwtVerifyOptions, TokenizerConstantBindings } from '../../../services'
import { JwtStrategy } from '../../types'

export class JwtUserRefreshStrategy implements AuthenticationStrategy {
  name = JwtStrategy.UserRefreshToken

  @inject(TokenizerConstantBindings.Jwt.v1.RefreshToken.DefaultVerifyOptions) options: JwtVerifyOptions

  constructor(@inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1) {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async authenticate() {
    const userProfile = await this.userSecurityService.verifyRefreshToken(this.options)

    if (await this.userSecurityService.isRefreshTokenRevoked()) {
      throw new HttpErrors.Unauthorized('Access revoked')
    }

    return userProfile
  }
}
