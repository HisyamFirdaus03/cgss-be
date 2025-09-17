import { UserProfile } from '@loopback/security'
import { JwtDecoded } from './types'

export namespace TokenizerService {
  export namespace Jwt {
    export interface v1<O> {
      decodeToken(token: string): Promise<JwtDecoded>

      generateAccessToken(userProfile: UserProfile): Promise<string>
      verifyAccessToken(token: string, options: O): Promise<UserProfile>
      getAccessTokenExpiresIn(): string

      generateRefreshToken(userProfile: UserProfile): Promise<string>
      verifyRefreshToken(token: string, options: O): Promise<UserProfile>
      getRefreshTokenExpiresIn(): string

      generateVerificationToken(userProfile: UserProfile): Promise<string>
      verifyVerificationToken(token: string, options: O): Promise<UserProfile>
      getVerificationTokenExpiresIn(): string

      generatePasswordToken(userProfile: UserProfile): Promise<string>
      verifyPasswordToken(token: string, options: O): Promise<UserProfile>
      getPaswordTokenExpiresIn(): string
    }
  }
}
