import { inject } from '@loopback/core'
import { repository } from '@loopback/repository'
import { HttpErrors, Request, RestBindings } from '@loopback/rest'
import { securityId, UserProfile } from '@loopback/security'
import {
  HasherService,
  HasherServiceBindings,
  JwtDecoded,
  JwtVerifyOptions,
  SecuritySchemeBindings,
  SecuritySchemeService,
  TokenizerService,
  TokenizerServiceBindings,
} from '../../services'
import { User } from '../../../models'
import { UserAccessGroupRepository, UserRepository, UserTokenRepository } from '../../../repositories'
import { SecurityService } from '../security.service'
import { UserWithLoginSession, WebLoginCredential } from '../types'

export namespace SecurityServiceProvider {
  export namespace Usr {
    export class v1 implements SecurityService.Usr.v1 {
      constructor(
        @inject(TokenizerServiceBindings.Jwt.v1) private tokenizerService: TokenizerService.Jwt.v1<JwtVerifyOptions>,
        @repository(UserRepository) private userRepository: UserRepository,
        @repository(UserAccessGroupRepository) private userAccessGroupRepository: UserAccessGroupRepository,
        @repository(UserTokenRepository) private userTokenRepository: UserTokenRepository,
        @inject(RestBindings.Http.REQUEST) private request: Request,
        @inject(SecuritySchemeBindings.v1.Service.AccessToken) private accessTokenScheme: SecuritySchemeService.v1,
        @inject(SecuritySchemeBindings.v1.Service.Authorization) private authorizationScheme: SecuritySchemeService.v1,
        @inject(SecuritySchemeBindings.v1.Service.Bearer) private bearerScheme: SecuritySchemeService.v1,
        @inject(HasherServiceBindings.Service.Bcrypt) private bcrypt: HasherService
      ) {}

      async getCurrentUserLowestAndTargetUagPriority(
        currentUserId: number,
        targetUagIdOrName: number | string
      ): Promise<{
        currentUserLowestUagPriority: number
        targetUagPriority: number
      }> {
        const currentUser = await this.userRepository.findById(currentUserId, { include: ['userAccessGroups'] })

        if (!currentUser) throw new HttpErrors[401]('Unauthorized access')

        const currentUserUags = currentUser.userAccessGroups
        if (currentUserUags.length < 1) throw new HttpErrors[403]('Insufficient right permission')
        const currentUserLowestPriority = Math.min(...currentUserUags.map((x) => x.priority))

        let targetUag
        if (typeof targetUagIdOrName === 'number') {
          targetUag = await this.userAccessGroupRepository.findById(targetUagIdOrName)
        } else if (typeof targetUagIdOrName === 'string') {
          targetUag = await this.userAccessGroupRepository.findOne({
            where: { name: targetUagIdOrName },
          })
        } else {
          throw new HttpErrors[403]('Invalid User Access Group Identifier')
        }

        if (!targetUag) {
          throw new HttpErrors[403]('Invalid User Access Group')
        }

        return {
          currentUserLowestUagPriority: currentUserLowestPriority,
          targetUagPriority: targetUag.priority,
        }
      }

      async getCurrentUserAndTargetUserLowestUagPriority(
        currentId: number,
        targetId: number
      ): Promise<{
        currentUserLowestUagPriority: number
        targetUserLowestUagPriority: number
      }> {
        const currentUser = await this.userRepository.findById(currentId, {
          include: ['userAccessGroups'],
        })
        if (!currentUser) throw new HttpErrors[401]('Unauthorized access')

        const currentUserUags = currentUser.userAccessGroups
        if (currentUserUags.length < 1) throw new HttpErrors[403]('Insufficient right permission')

        const currentUserLowestPriority = Math.min(...currentUserUags.map((x) => x.priority))

        const targetUser = await this.userRepository.findById(targetId, {
          include: ['userAccessGroups'],
        })
        if (!targetUser) throw new HttpErrors[404]('Target not found')

        let targetUserLowestPriority = 100000
        const targetUserUags = targetUser.userAccessGroups
        if (targetUserUags?.length > 0) {
          targetUserLowestPriority = Math.min(...targetUserUags.map((x) => x.priority))
        }

        return {
          currentUserLowestUagPriority: currentUserLowestPriority,
          targetUserLowestUagPriority: targetUserLowestPriority,
        }
      }

      async generateAccessToken(user: User): Promise<string> {
        const profile = this.convertToUserProfile(user)
        return this.tokenizerService.generateAccessToken(profile)
      }

      async verifyAccessToken(options: JwtVerifyOptions): Promise<UserProfile> {
        const token = await this.getToken()

        return this.tokenizerService.verifyAccessToken(token, options)
      }

      async revokeAccessToken(token?: string | undefined): Promise<void> {
        if (!token) {
          token = await this.getToken()
        }
        await this.userTokenRepository.deleteAll({ accessToken: token })
      }

      async revokeAllAccessToken(_securityId: number): Promise<void> {
        await this.userTokenRepository.deleteAll({ securityId: _securityId })
      }

      async isAccessTokenRevoked(token?: string): Promise<boolean> {
        if (!token) {
          token = await this.getToken()
        }
        const userToken = await this.userTokenRepository.count({ accessToken: token })

        if (userToken.count > 0) return false
        return true
      }

      async generateRefreshToken(user: User): Promise<string> {
        const profile = this.convertToUserProfile(user)
        return this.tokenizerService.generateRefreshToken(profile)
      }

      async verifyRefreshToken(options: JwtVerifyOptions): Promise<UserProfile> {
        const token = await this.getToken()

        return this.tokenizerService.verifyRefreshToken(token, options)
      }

      async revokeRefreshToken(token?: string | undefined): Promise<void> {
        if (!token) {
          token = await this.getToken()
        }
        await this.userTokenRepository.deleteAll({ refreshToken: token })
      }

      async revokeAllRefreshToken(_securityId: number): Promise<void> {
        await this.userTokenRepository.deleteAll({ securityId: _securityId })
      }

      async isRefreshTokenRevoked(token?: string): Promise<boolean> {
        if (!token) {
          token = await this.getToken()
        }
        const userToken = await this.userTokenRepository.count({ refreshToken: token })
        if (userToken.count > 0) return false
        return true
      }

      async generateVerificationToken(user: User): Promise<string> {
        const userProfile = this.convertToUserProfile(user)

        const verificationToken = await this.tokenizerService.generateVerificationToken(userProfile)

        await this.userRepository.updateById(user.id, { verificationToken })
        return verificationToken
      }

      async verifyVerificationToken(options: JwtVerifyOptions): Promise<UserProfile> {
        const token = await this.getToken()

        return this.tokenizerService.verifyVerificationToken(token, options)
      }

      async revokeVerificationToken(token?: string | undefined): Promise<void> {
        if (!token) {
          token = await this.getToken()
        }
        const userProfile = await this.tokenizerService.verifyVerificationToken(token, { ignoreExpiration: true })
        await this.userRepository.updateById(Number(userProfile[securityId]), { verificationToken: '' })
      }

      async isVerificationTokenRevoked(token?: string): Promise<boolean> {
        if (!token) {
          token = await this.getToken()
        }
        const user = await this.userRepository.count({ verificationToken: token })
        if (user.count > 0) return false
        return true
      }

      async generatePasswordToken(user: User): Promise<string> {
        const userProfile = this.convertToUserProfile(user)

        const passwordToken = await this.tokenizerService.generatePasswordToken(userProfile)

        await this.userRepository.updateById(user.id, { resetPwdToken: passwordToken })
        return passwordToken
      }

      async verifyPasswordToken(options: JwtVerifyOptions): Promise<UserProfile> {
        const token = await this.getToken()

        return this.tokenizerService.verifyPasswordToken(token, options)
      }

      async revokePasswordToken(token?: string | undefined): Promise<void> {
        if (!token) {
          token = await this.getToken()
        }
        const userProfile = await this.tokenizerService.verifyPasswordToken(token, { ignoreExpiration: true })
        await this.userRepository.updateById(Number(userProfile[securityId]), { resetPwdToken: '' })
      }

      async isPasswordTokenRevoked(token?: string): Promise<boolean> {
        if (!token) {
          token = await this.getToken()
        }
        const user = await this.userRepository.count({ resetPwdToken: token })
        if (user.count > 0) return false
        return true
      }

      async getToken(): Promise<string> {
        const accessToken = await this.accessTokenScheme.extractToken(this.request)
        if (accessToken != null) {
          return accessToken
        }

        const authorizationToken = await this.authorizationScheme.extractToken(this.request)
        if (authorizationToken != null) {
          return authorizationToken
        }

        const bearerToken = await this.bearerScheme.extractToken(this.request)
        if (bearerToken != null) {
          return bearerToken
        }

        throw new HttpErrors.Unauthorized('Invalid authorization header')
      }

      async verifyCredentials(credentials: WebLoginCredential): Promise<User> {
        if (!credentials.usernameOrEmail) {
          throw new HttpErrors.BadRequest('Please enter your username or password')
        }
        if (!credentials.password) throw new HttpErrors.BadRequest('Please enter your password')
        const user = await this.userRepository.findOne({
          where: {
            or: [{ email: credentials.usernameOrEmail }, { username: credentials.usernameOrEmail }],
          },
          fields: ['id', 'password', 'isDeleted', 'emailVerified'],
        })
        if (!user) throw new HttpErrors.NotFound('User not found, please enter the correct username or email.')
        if (!user.password) throw new HttpErrors.Unauthorized('Your account is unsecured, please contact the site administrator')
        if (user.isDeleted) throw new HttpErrors.Unauthorized('Your account has been suspended, please contact the site administrator')

        const pwdMatched = await this.bcrypt.compare(credentials.password, user.password)
        if (!pwdMatched) throw new HttpErrors.Unauthorized('Please enter the correct password.')

        return this.userRepository.findById(user.id, {
          fields: UserWithLoginSession.exclusions.getUserExclusions(),
          include: [
            {
              relation: 'userDetail',
              scope: {
                fields: UserWithLoginSession.exclusions.getUserDetailExclusions(),
              },
            },
            {
              relation: 'userAccessGroups',
              scope: {
                fields: UserWithLoginSession.exclusions.getUserAccessGroupExclusions(),
              },
            },
          ],
        })
      }

      async decodeToken(token: string): Promise<JwtDecoded> {
        return this.tokenizerService.decodeToken(token)
      }

      convertToUserProfile(user: User): UserProfile {
        return {
          [securityId]: user.id?.toString() ?? '0',
          name: user.name,
          email: user.email,
        }
      }
    }
  }
}
