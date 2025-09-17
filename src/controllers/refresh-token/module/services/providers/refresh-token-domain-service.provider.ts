import { inject } from '@loopback/core'
import { repository } from '@loopback/repository'
import { HttpErrors } from '@loopback/rest'
import { securityId } from '@loopback/security'
import { SecurityService, SecurityServiceBindings, UserWithLoginSession, UserWithUagAndUserDetail } from '../../../../../common'
import { UserRepository, UserTokenRepository } from '../../../../../repositories'
import { RefreshTokenDomainService } from '../refresh-token-domain.service'

export namespace RefreshTokenDomainServiceProvider {
  export class v1 implements RefreshTokenDomainService.v1 {
    constructor(
      @repository(UserRepository) private userRepository: UserRepository,
      @repository(UserTokenRepository) private userTokenRepository: UserTokenRepository,
      @inject(SecurityServiceBindings.Usr.v1) public userSecurityService: SecurityService.Usr.v1
    ) {}

    async getTokenOwner(): Promise<UserWithUagAndUserDetail> {
      const userProfile = await this.userSecurityService.verifyRefreshToken({ ignoreExpiration: false })

      return (await this.userRepository.findById(Number(userProfile[securityId]), {
        fields: UserWithUagAndUserDetail.exclusions.getUserExclusions(),
        include: [
          {
            relation: 'userAccessGroups',
            scope: {
              fields: UserWithUagAndUserDetail.exclusions.getUserAccessGroupExclusions(),
            },
          },
          {
            relation: 'userDetail',
            scope: {
              fields: UserWithUagAndUserDetail.exclusions.getUserDetailExclusions(),
            },
          },
        ],
      })) as UserWithUagAndUserDetail
    }

    async refreshAccessToken(): Promise<UserWithLoginSession> {
      const refreshToken = await this.userSecurityService.getToken()

      const userProfile = await this.userSecurityService.verifyRefreshToken({ ignoreExpiration: false })

      const user = await this.userRepository.findOne({
        where: {
          id: Number(userProfile[securityId]),
        },
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

      if (!user) {
        throw new HttpErrors[404]()
      }

      const newAccessToken = await this.userSecurityService.generateAccessToken(user)
      const newRefreshToken = await this.userSecurityService.generateRefreshToken(user)

      const decodedToken = await this.userSecurityService.decodeToken(newRefreshToken)
      const now = new Date(0)

      try {
        await this.userTokenRepository.create({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          securityId: user.id,
          expiresAt: now.setUTCSeconds(decodedToken.payload.exp),
        })
      } catch (e) {
        console.log(e)
        throw new Error(e)
      }

      await this.userTokenRepository.deleteAll({ refreshToken })

      return Object.assign({ accessToken: newAccessToken, refreshToken: newRefreshToken }, { ...user }) as UserWithLoginSession
    }
  }
}
