import { UserService } from '@loopback/authentication'
import { UserProfile } from '@loopback/security'
import { User } from '../../models'
import { JwtDecoded, JwtVerifyOptions } from '../services'
import { WebLoginCredential } from './types'

export namespace SecurityService {
  export namespace Usr {
    export interface v1 extends UserService<User, WebLoginCredential> {
      getToken(): Promise<string>
      decodeToken(token: string): Promise<JwtDecoded>
      getCurrentUserAndTargetUserLowestUagPriority(
        currentUserId: number,
        targetUserId: number
      ): Promise<{
        currentUserLowestUagPriority: number
        targetUserLowestUagPriority: number
      }>
      getCurrentUserLowestAndTargetUagPriority(
        currentUserId: number,
        targetUagIdOrName: number | string
      ): Promise<{
        currentUserLowestUagPriority: number
        targetUagPriority: number
      }>

      generateAccessToken(user: User): Promise<string>
      verifyAccessToken(options: JwtVerifyOptions): Promise<UserProfile>
      revokeAccessToken(token?: string): Promise<void>
      revokeAllAccessToken(securityId: number): Promise<void>
      isAccessTokenRevoked(token?: string): Promise<boolean>

      generateRefreshToken(user: User): Promise<string>
      verifyRefreshToken(options: JwtVerifyOptions): Promise<UserProfile>
      revokeRefreshToken(token?: string): Promise<void>
      revokeAllRefreshToken(securityId: number): Promise<void>
      isRefreshTokenRevoked(token?: string): Promise<boolean>

      generatePasswordToken(user: User): Promise<string>
      verifyPasswordToken(options: JwtVerifyOptions): Promise<UserProfile>
      revokePasswordToken(token?: string): Promise<void>
      isPasswordTokenRevoked(token?: string): Promise<boolean>

      generateVerificationToken(user: User): Promise<string>
      verifyVerificationToken(options: JwtVerifyOptions): Promise<UserProfile>
      revokeVerificationToken(token?: string): Promise<void>
      isVerificationTokenRevoked(token?: string): Promise<boolean>
    }
  }
}
