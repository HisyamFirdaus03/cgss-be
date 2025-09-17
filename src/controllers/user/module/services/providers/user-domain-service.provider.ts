import { inject } from '@loopback/core'
import { Count, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository'
import { HttpErrors } from '@loopback/rest'
import { securityId } from '@loopback/security'
import {
  EmailerService,
  EmailerServiceBindings,
  HasherService,
  HasherServiceBindings,
  SecurityService,
  SecurityServiceBindings,
  UserLogout,
  UserPatch,
  UserWithLoginSession,
  UserWithUagAndUserDetail,
  UserWithUagAndUserDetailPagedUser,
  UserWithUserDetail,
} from '../../../../../common'
import { EmailResetPasswordConfig, EmailVerificationConfig } from '../../../../../configurations/services'
import { User } from '../../../../../models'
import { UserRepository, UserTokenRepository } from '../../../../../repositories'
import { UserDomainService } from '../user-domain.service'

export namespace UserDomainServiceProvider {
  export class v1 implements UserDomainService.v1 {
    constructor(
      @inject(HasherServiceBindings.Service.Bcrypt) private bcrypt: HasherService,
      @repository(UserRepository) private userRepository: UserRepository,
      @repository(UserTokenRepository) private userTokenRepository: UserTokenRepository,
      @inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1,
      @inject(EmailerServiceBindings.Service.Nodemailer) private nodemailer: EmailerService
    ) {}

    async login(usernameOrEmail: string, password: string): Promise<UserWithLoginSession> {
      const user = await this.userSecurityService.verifyCredentials({
        usernameOrEmail,
        password,
      })

      if (!user.emailVerified) {
        throw new HttpErrors[403](
          'Unverified account! Please check your email, ' + 'or request a new verification link'
        )
      }

      const accessToken = await this.userSecurityService.generateAccessToken(user)

      const refreshToken = await this.userSecurityService.generateRefreshToken(user)

      const decodedToken = await this.userSecurityService.decodeToken(refreshToken)
      const now = new Date(0)
      await this.userTokenRepository.create({
        accessToken: accessToken,
        refreshToken: refreshToken,
        securityId: user.id,
        expiresAt: now.setUTCSeconds(decodedToken.payload.exp),
      })

      const loginSession = Object.assign(
        {
          accessToken,
          refreshToken,
        },
        { ...user }
      ) as UserWithLoginSession
      return loginSession
    }

    async logout(): Promise<UserLogout | null> {
      const token = await this.userSecurityService.getToken()
      const userProfile = await this.userSecurityService.verifyAccessToken({ ignoreExpiration: true })

      await this.userTokenRepository.deleteAll({ accessToken: token })

      return this.userRepository.findOne({
        where: { id: Number(userProfile[securityId]) },
        fields: UserLogout.exclusions.getUserExclusions(),
      })
    }

    count(where: Where<User>): Promise<Count> {
      return this.userRepository.count(where)
    }

    async updateById(id: number, user: Partial<UserPatch>): Promise<UserWithUserDetail> {
      await this.userRepository.updateById(id, user)
      return this.userRepository.findById(id, {
        fields: UserWithUserDetail.exclusions.getUserExclusions(),
        include: [
          {
            relation: 'userDetail',
            scope: {
              fields: UserWithUserDetail.exclusions.getUserDetailExclusions(),
            },
          },
        ],
      })
    }

    async updateAll(user: Partial<User>, where?: Where<User> | undefined): Promise<Count> {
      return this.userRepository.updateAll(user, where)
    }

    async findById(userId: number, filter?: FilterExcludingWhere<User>): Promise<User> {
      return this.userRepository.findById(userId, filter)
    }

    async find(filter?: Filter<User> | undefined): Promise<UserWithUagAndUserDetailPagedUser> {
      const users = await this.userRepository.find(filter)
      const count = await this.userRepository.count(filter?.where)
      const result = new UserWithUagAndUserDetailPagedUser()
      result.users = users
      result.pagination = {
        users: {
          count: count.count,
          limit: filter?.limit ?? 0,
          skip: filter?.offset ?? filter?.skip ?? 0,
        },
      }

      return result
    }

    async deleteById(id: number): Promise<UserWithUagAndUserDetail> {
      const user = await this.userRepository.findById(id, {
        fields: UserWithUagAndUserDetail.exclusions.getUserExclusions(),
        include: [
          {
            relation: 'userDetail',
            scope: {
              fields: UserWithUagAndUserDetail.exclusions.getUserDetailExclusions(),
            },
          },
          {
            relation: 'userAccessGroups',
            scope: {
              fields: UserWithUagAndUserDetail.exclusions.getUserAccessGroupExclusions(),
            },
          },
        ],
      })
      for (let i = 0; i < user.userAccessGroups.length; i++) {
        if (user.userAccessGroups[i].priority === 1) {
          throw new HttpErrors[403]('Forbidden')
        }
      }

      await this.userRepository.userDetail(id).delete()
      await this.userRepository.userAccessGroups(id).unlinkAll()
      await this.userSecurityService.revokeAllAccessToken(id)
      await this.userRepository.deleteById(id)
      user.isDeleted = true
      return user
    }

    async requestResetPassword(emailOrUsername: string): Promise<string> {
      const user = await this.userRepository.findOne({
        where: {
          or: [{ username: emailOrUsername }, { email: emailOrUsername }],
        },
      })
      if (!user || !user?.id) {
        throw new HttpErrors.NotFound('User not found')
      }
      const pwdToken = await this.userSecurityService.generatePasswordToken(user)
      await this.userSecurityService.revokeAllAccessToken(user.id)

      user.resetPwdToken = pwdToken
      await this.nodemailer.sendResetPasswordLink(user.email, pwdToken)
      return EmailResetPasswordConfig.linkUrl + pwdToken
    }
    async resetPasswordById(userId: number, password: string): Promise<string> {
      if (!password || !userId) throw new HttpErrors.Forbidden('Forbidden requrest')

      const hashedPwd = await this.bcrypt.hash(password)
      await this.userRepository.updateById(userId, {
        resetPwdToken: '',
        password: hashedPwd,
      })
      return 'Your password has been successfully updated.' + 'You may proceed to login with the new password'
    }
    async resetPasswordByToken(password: string): Promise<string> {
      const userProfile = await this.userSecurityService.verifyPasswordToken({ ignoreExpiration: false })
      const userId = Number(userProfile[securityId])

      return this.resetPasswordById(userId, password)
    }

    async requestEmailVerificationById(userId: number): Promise<string> {
      const user = await this.userRepository.findById(userId)
      if (!user || !user?.id) {
        throw new HttpErrors[404]('User not found')
      }
      if (user.emailVerified) {
        throw new HttpErrors[400]('Email address is already verified')
      }

      return this.requestEmailVerification(user)
    }
    async requestEmailVerificationByCredential(usernameOrEmail: string, password: string): Promise<string> {
      if (!usernameOrEmail || !password) {
        throw new HttpErrors.Forbidden('Invalid credential')
      }
      const user = await this.userSecurityService.verifyCredentials({
        usernameOrEmail,
        password,
      })
      if (user.emailVerified) {
        throw new HttpErrors[400]('Email address is already verified')
      }

      return this.requestEmailVerification(user)
    }
    async verifyEmail(userId?: number | undefined): Promise<string> {
      let user: User | null = null
      if (!userId) {
        const userProfile = await this.userSecurityService.verifyVerificationToken({ ignoreExpiration: false })
        user = await this.userRepository.findById(Number(userProfile[securityId]))
      } else {
        user = await this.userRepository.findById(userId)
      }
      if (!user) throw new HttpErrors.NotFound('User not found')

      await this.userRepository.updateById(user.id, {
        verificationToken: '',
        emailVerified: true,
      })
      await this.userSecurityService.revokeAllAccessToken(user.id!)
      return 'Thank You. Your account has been successfully verified.' + 'You may proceeed to log in to your account'
    }

    async deactivate(id: number): Promise<UserWithUserDetail> {
      await this.userRepository.updateById(id, {
        isDeleted: true,
        verificationToken: '',
        emailVerified: false,
      })
      await this.userSecurityService.revokeAllAccessToken(id)
      return this.userRepository.findById(id, {
        fields: UserWithUserDetail.exclusions.getUserExclusions(),
        include: [
          {
            relation: 'userDetail',
            scope: {
              fields: UserWithUserDetail.exclusions.getUserDetailExclusions(),
            },
          },
        ],
      })
    }
    async reactivate(id: number): Promise<UserWithUserDetail> {
      await this.userRepository.updateById(id, {
        isDeleted: false,
        emailVerified: true,
      })
      await this.userSecurityService.revokeAllAccessToken(id)
      return this.userRepository.findById(id, {
        fields: UserWithUserDetail.exclusions.getUserExclusions(),
        include: [
          {
            relation: 'userDetail',
            scope: {
              fields: UserWithUserDetail.exclusions.getUserDetailExclusions(),
            },
          },
        ],
      })
    }

    //==========================================================================

    private async requestEmailVerification(user: User) {
      const vToken = await this.userSecurityService.generateVerificationToken(user)
      await this.userRepository.updateById(user.id, {
        verificationToken: vToken,
        emailVerified: false,
      })
      await this.userSecurityService.revokeAllAccessToken(user.id!)

      user.verificationToken = vToken
      await this.nodemailer.sendEmailVerificationLink(user.email, vToken)
      return EmailVerificationConfig.linkUrl + vToken
    }
  }
}
