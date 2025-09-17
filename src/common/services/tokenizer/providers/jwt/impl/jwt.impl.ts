import { inject } from '@loopback/core'
import { HttpErrors } from '@loopback/rest'
import { securityId, UserProfile } from '@loopback/security'
import { promisify } from 'util'
import { TokenizerConstantBindings } from '../../../tokenizer.bindings'
import { TokenizerService } from '../../../tokenizer.service'
import { JwtDecoded, JwtSignOptions, JwtVerifyOptions } from '../../../types'

const jwt = require('jsonwebtoken')
const signAsync = promisify(jwt.sign)
const verifyAsync = promisify(jwt.verify)

export namespace JwtImpl {
  export class v1 implements TokenizerService.Jwt.v1<JwtVerifyOptions> {
    constructor(
      @inject(TokenizerConstantBindings.Jwt.v1.AccessToken.Secret) private accessTokenSecret: string,
      @inject(TokenizerConstantBindings.Jwt.v1.AccessToken.ExpiresIn) private accessTokenExpiresIn: string,
      @inject(TokenizerConstantBindings.Jwt.v1.PasswordToken.Secret) private passwordTokenSecret: string,
      @inject(TokenizerConstantBindings.Jwt.v1.PasswordToken.ExpiresIn) private passwordTokenExpiresIn: string,
      @inject(TokenizerConstantBindings.Jwt.v1.VerificationToken.Secret) private verificationTokenSecret: string,
      @inject(TokenizerConstantBindings.Jwt.v1.VerificationToken.ExpiresIn) private verificationTokenExpiresIn: string,
      @inject(TokenizerConstantBindings.Jwt.v1.RefreshToken.Secret) private refreshTokenSecret: string,
      @inject(TokenizerConstantBindings.Jwt.v1.RefreshToken.ExpiresIn) private refreshTokenExpiresIn: string
    ) {}

    async decodeToken(token: string): Promise<JwtDecoded> {
      return jwt.decode(token, { complete: true, json: true })
    }

    async generateAccessToken(userProfile: UserProfile): Promise<string> {
      if (!userProfile) {
        throw new HttpErrors.Unauthorized('Error generating token : Invalid UserProfile')
      }

      try {
        return await this.generateToken(userProfile, this.accessTokenSecret, {
          expiresIn: Number(this.accessTokenExpiresIn),
        })
      } catch (error) {
        throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`)
      }
    }

    async verifyAccessToken(token: string, options: JwtVerifyOptions): Promise<UserProfile> {
      return this.verifyToken(token, this.accessTokenSecret, options)
    }

    getAccessTokenExpiresIn(): string {
      return this.accessTokenExpiresIn
    }

    async generateRefreshToken(userProfile: UserProfile): Promise<string> {
      if (!userProfile) {
        throw new HttpErrors.Unauthorized('Error generating token : Invalid UserProfile')
      }

      try {
        return await this.generateToken(userProfile, this.refreshTokenSecret, {
          expiresIn: Number(this.refreshTokenExpiresIn),
        })
      } catch (error) {
        throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`)
      }
    }

    async verifyRefreshToken(token: string, options: JwtVerifyOptions): Promise<UserProfile> {
      return this.verifyToken(token, this.refreshTokenSecret, options)
    }

    getRefreshTokenExpiresIn(): string {
      return this.refreshTokenExpiresIn
    }

    async generateVerificationToken(userProfile: UserProfile): Promise<string> {
      if (!userProfile) {
        throw new HttpErrors.Unauthorized('Error generating token : Invalid UserProfile')
      }

      try {
        return await this.generateToken(userProfile, this.verificationTokenSecret, {
          expiresIn: Number(this.verificationTokenExpiresIn),
        })
      } catch (error) {
        throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`)
      }
    }

    async verifyVerificationToken(token: string, options: JwtVerifyOptions): Promise<UserProfile> {
      return this.verifyToken(token, this.verificationTokenSecret, options)
    }

    getVerificationTokenExpiresIn(): string {
      return this.verificationTokenExpiresIn
    }

    async generatePasswordToken(userProfile: UserProfile): Promise<string> {
      if (!userProfile) {
        throw new HttpErrors.Unauthorized('Error generating token : Invalid UserProfile')
      }

      try {
        return await this.generateToken(userProfile, this.passwordTokenSecret, {
          expiresIn: Number(this.passwordTokenExpiresIn),
        })
      } catch (error) {
        throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`)
      }
    }

    async verifyPasswordToken(token: string, options: JwtVerifyOptions): Promise<UserProfile> {
      return this.verifyToken(token, this.passwordTokenSecret, options)
    }
    getPaswordTokenExpiresIn(): string {
      return this.passwordTokenExpiresIn
    }

    // ========================================================================

    private async generateToken(userProfile: UserProfile, secret: string, options: JwtSignOptions): Promise<string> {
      try {
        const { [securityId]: secureId, ...profile } = userProfile
        return await signAsync(Object.assign({ securityId: secureId }, profile), secret, options)
      } catch (error) {
        throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`)
      }
    }

    private async verifyToken(token: string, secret: string, options: JwtVerifyOptions): Promise<UserProfile> {
      if (!token) {
        throw new HttpErrors.Unauthorized(`Error verifying token : 'token' is not present`)
      }

      try {
        const tokenPayload = await verifyAsync(token, secret, options)
        if (!tokenPayload.securityId) {
          throw new HttpErrors.Unauthorized('Invalid token')
        }

        const { securityId: secureId, ...profile } = tokenPayload
        return Object.assign(
          {
            [securityId]: secureId,
          },
          profile
        ) as UserProfile
      } catch (error) {
        throw new HttpErrors.Unauthorized(`Error verifying token : ${error.message}`)
      }
    }
  }
}
