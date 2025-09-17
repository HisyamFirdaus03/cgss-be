import { AuthenticationStrategy } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { HttpErrors, RedirectRoute } from '@loopback/rest'
import { UserProfile } from '@loopback/security'
import { SecurityService, SecurityServiceBindings } from '../../../security'
import { JwtVerifyOptions, TokenizerConstantBindings } from '../../../services'
import { JwtStrategy } from '../../types'

export class JwtUserVerificationStrategy implements AuthenticationStrategy {
  name = JwtStrategy.UserVerificationToken

  @inject(TokenizerConstantBindings.Jwt.v1.VerificationToken.DefaultVerifyOptions)
  options: JwtVerifyOptions

  constructor(@inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1) {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async authenticate(): Promise<UserProfile | RedirectRoute | undefined> {
    const userProfile = await this.userSecurityService.verifyVerificationToken(this.options)

    if (await this.userSecurityService.isVerificationTokenRevoked()) {
      throw new HttpErrors.Unauthorized('Access revoked')
    }

    return userProfile
  }
}
