import { AuthenticationStrategy } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { HttpErrors, RedirectRoute } from '@loopback/rest'
import { UserProfile } from '@loopback/security'
import { SecurityService, SecurityServiceBindings } from '../../../security'
import { JwtVerifyOptions, TokenizerConstantBindings } from '../../../services'
import { JwtStrategy } from '../../types'

export class JwtUserAccessStrategy implements AuthenticationStrategy {
  name = JwtStrategy.UserAccessToken

  @inject(TokenizerConstantBindings.Jwt.v1.AccessToken.DefaultVerifyOptions) options: JwtVerifyOptions

  constructor(@inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1) {}

  async authenticate(): Promise<UserProfile | RedirectRoute | undefined> {
    const userProfile = await this.userSecurityService.verifyAccessToken(this.options)

    if (await this.userSecurityService.isAccessTokenRevoked()) {
      throw new HttpErrors.Unauthorized('Access revoked')
    }

    return userProfile
  }
}
