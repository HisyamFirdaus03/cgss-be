import { inject } from '@loopback/core'
import { Count, Filter, repository } from '@loopback/repository'
import { HttpErrors } from '@loopback/rest'
import {
  EmailerService,
  EmailerServiceBindings,
  HasherService,
  HasherServiceBindings,
  SecurityService,
  SecurityServiceBindings,
  UserAccessLevel,
  UserWithUag,
  UserWithUagAndUserDetailPagedUser,
  UserWithUserDetail,
  UserWithUserDetailModel,
} from '../../../../../common'

import { EmailVerificationConfig } from '../../../../../configurations/services'
import { User, UserAccessGroup } from '../../../../../models'
import { UserAccessGroupMapRepository, UserAccessGroupRepository, UserRepository } from '../../../../../repositories'
import * as EmailValidator from 'email-validator'
import { UagUsersDomainService } from '../uag-user-domain.service'

export namespace UagUserDomainServiceProvider {
  export class v1 implements UagUsersDomainService.v1 {
    constructor(
      @repository(UserRepository) private usrRepository: UserRepository,
      @repository(UserAccessGroupRepository) private uagRepository: UserAccessGroupRepository,
      @repository(UserAccessGroupMapRepository) private userAccessGroupMapRepository: UserAccessGroupMapRepository,
      @inject(HasherServiceBindings.Service.Bcrypt) private bcrypt: HasherService,
      @inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1,
      @inject(EmailerServiceBindings.Service.Nodemailer) private nodemailer: EmailerService
    ) {}

    async byUagFindUsrs(
      uagIdentifier: number | UserAccessLevel.name,
      filter?: Filter<User>
    ): Promise<UserWithUagAndUserDetailPagedUser> {
      const uag = await this.getUserAccessGroup(uagIdentifier)

      if (!filter) {
        filter = {}
      }

      if (filter?.fields) {
        filter.fields = {
          ...filter.fields,
          ...UserWithUagAndUserDetailPagedUser.exclusions.getUserExclusions(),
        }
      } else {
        filter.fields = {
          ...UserWithUagAndUserDetailPagedUser.exclusions.getUserExclusions(),
        }
      }
      const usersWhere = await this.uagRepository.users(uag.id).find({
        where: filter.where,
      })

      const pagedUsers = new UserWithUagAndUserDetailPagedUser()
      pagedUsers.users = await this.uagRepository.users(uag.id).find(filter)
      pagedUsers.pagination = {
        users: {
          limit: filter?.limit ?? 0,
          skip: filter?.skip ?? filter?.offset ?? 0,
          count: usersWhere.length,
        },
      }

      return pagedUsers
    }

    async byUagCreateUsr(
      uagIdentifier: number | UserAccessLevel.name,
      user: UserWithUserDetailModel
    ): Promise<UserWithUserDetail> {
      if (!user) throw new HttpErrors.BadRequest('Invalid User instance')
      if (!user.email) throw new HttpErrors.BadRequest('Email is required')
      if (!user.password) throw new HttpErrors.BadRequest('Missing password field')
      if (!EmailValidator.validate(user.email)) throw new HttpErrors.BadRequest('Invalid Email')

      const uag = await this.getUserAccessGroup(uagIdentifier)
      const createdUsr = await this.uagRepository.users(uag.id).create(
        Object.assign(
          {},
          {
            name: user.name,
            username: user.username,
            email: user.email,
            cardId: user.cardId,
            staffId: user.staffId,
            isDeleted: false,
            realm: '',
            password: await this.bcrypt.hash(user.password),
            verificationToken: '',
            resetPwdToken: '',
            emailVerified: !EmailVerificationConfig.required,
            createdAt: new Date().toUTCString(),
            updatedAt: new Date().toUTCString(),
          }
        )
      )
      if (user.userDetail) {
        await this.usrRepository.userDetail(createdUsr.id).create(user.userDetail)
      }

      if (EmailVerificationConfig.required) {
        const verificationToken = await this.userSecurityService.generateVerificationToken(createdUsr)

        user.verificationToken = verificationToken
        await this.nodemailer.sendEmailVerificationLink(user.email, verificationToken)
      }

      return this.usrRepository.findById(createdUsr.id, {
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

    async byUagLinkUsr(uagIdentifier: number | UserAccessLevel.name, usrId: number): Promise<UserWithUag> {
      const user = await this.usrRepository.findById(usrId)
      if (!user) {
        throw new HttpErrors.NotFound('User not found')
      }
      const uag = await this.getUserAccessGroup(uagIdentifier)

      if (user.isDeleted) {
        await this.usrRepository.updateById(user.id, { isDeleted: false })
      }
      const existingUsers = await this.uagRepository.users(uag.id).find({ where: { id: usrId } })
      if (existingUsers.length > 0) {
        return user
      }

      await this.uagRepository.users(uag.id).link(usrId)
      return this.usrRepository.findById(usrId, {
        fields: UserWithUserDetail.exclusions.getUserExclusions(),
        include: [
          {
            relation: 'userAccessGroups',
            scope: {
              fields: UserWithUag.exclusions.getUserAccessGroupExclusions(),
            },
          },
        ],
      })
    }

    async byUagUnlinkUsr(
      uagIdentifier: number | UserAccessLevel.name,
      usrId: number | undefined
    ): Promise<UserWithUag> {
      const user = await this.usrRepository.findById(usrId)
      if (!user) {
        throw new HttpErrors.NotFound('User not found')
      }
      const uag = await this.getUserAccessGroup(uagIdentifier)
      await this.uagRepository.users(uag?.id).unlink(usrId)

      return this.usrRepository.findById(usrId, {
        fields: UserWithUserDetail.exclusions.getUserExclusions(),
        include: [
          {
            relation: 'userAccessGroups',
            scope: {
              fields: UserWithUag.exclusions.getUserAccessGroupExclusions(),
            },
          },
        ],
      })
    }

    async byUagUnlinkUsrs(uagIdentifier: number | UserAccessLevel.name): Promise<Count> {
      const uag = await this.getUserAccessGroup(uagIdentifier)
      if (uag.name === UserAccessLevel.name.root) {
        throw new HttpErrors.Unauthorized('Insufficient access permission')
      }
      const users = await this.uagRepository.users(uag.id).find({ fields: ['id'] })
      await this.uagRepository.users(uag.id).unlinkAll()
      return {
        count: users.length,
      }
    }

    async byUagReset(): Promise<Count> {
      let counter = 0
      const keys = Object.keys(UserAccessLevel.name)
      for (const index in keys) {
        if (keys[index] != UserAccessLevel.name.root) {
          const uag = await this.uagRepository.findOne({ where: { name: keys[index] } })
          if (uag) {
            const users = await this.uagRepository.users(uag.id).find({ fields: ['id'] })
            counter = counter + users.length
            if (users.length > 0) {
              await this.uagRepository.users(uag.id).unlinkAll()
            }
          }
        }
      }

      return {
        count: counter,
      }
    }

    private async getUserAccessGroup(uagVal: unknown): Promise<UserAccessGroup> {
      let uag: UserAccessGroup | null
      switch (typeof uagVal) {
        case 'number': {
          uag = await this.uagRepository.findById(uagVal)
          break
        }
        case 'string': {
          uag = await this.uagRepository.findOne({ where: { name: uagVal } })
          break
        }
        default: {
          throw new HttpErrors.UnprocessableEntity('Unknown User Access Group identifier type')
        }
      }
      if (!uag) throw new HttpErrors[404]('User Access Group not found')
      if (!uag.id) throw new HttpErrors[404]('User Access Group not found')
      return uag
    }
  }
}
