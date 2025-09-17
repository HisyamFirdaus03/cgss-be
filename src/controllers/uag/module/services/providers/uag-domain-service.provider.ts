import { inject } from '@loopback/core'
import { Filter, Inclusion, repository } from '@loopback/repository'
import { HttpErrors } from '@loopback/rest'
import { securityId, UserProfile } from '@loopback/security'
import { SecurityService, SecurityServiceBindings } from '../../../../../common'
import { UagWithUserPagedUsers } from '../../../../../common'
import { UserAccessGroup } from '../../../../../models'
import { UserAccessGroupRepository, UserRepository } from '../../../../../repositories'
import { UagDomainService } from '..'

export namespace UagDomainServiceProvider {
  export class v1 implements UagDomainService.v1 {
    constructor(
      @repository(UserRepository) private userRepository: UserRepository,
      @repository(UserAccessGroupRepository) private userAccessGroupRepository: UserAccessGroupRepository,
      @inject(SecurityServiceBindings.Usr.v1) private userSecurityService: SecurityService.Usr.v1
    ) {}

    async getManagedUags(filter?: Filter<UserAccessGroup>): Promise<UagWithUserPagedUsers[]> {
      const userProfile = await this.userSecurityService.verifyAccessToken({
        ignoreExpiration: false,
      })

      const managedUagIds = await this.getUagIds(userProfile)
      if (managedUagIds.length < 1) {
        return []
      }

      const managedUsers = new Array<UagWithUserPagedUsers>(managedUagIds.length)
      for (let i = 0; i < managedUagIds.length; i++) {
        const uagId = managedUagIds[i].id
        const uag = await this.userAccessGroupRepository.findById(uagId, filter)
        managedUsers[i] = uag
        if (filter?.include) {
          let isUserIncluded = false
          let userLimit = 0
          let userSkip = 0
          let userCount = 0
          for (let i = 0; i < filter.include.length; i++) {
            if (typeof filter.include[i] === 'string') {
              if (filter.include[i] === 'users') {
                isUserIncluded = true
                userCount = uag.users ? uag.users.length : 0
                break
              }
            } else {
              const inc = filter.include[i] as Inclusion
              if (inc.relation === 'users') {
                isUserIncluded = true
                userLimit = inc.scope?.limit ?? 0
                userSkip = inc.scope?.skip ?? inc.scope?.offset ?? 0
                const usrs = await this.userAccessGroupRepository
                  .users(uagId)
                  .find({ where: inc.scope?.where, fields: ['id'] })
                userCount = usrs.length
                break
              }
            }
          }
          if (isUserIncluded) {
            if (!uag.users) {
              uag.users = []
            }

            managedUsers[i] = new UagWithUserPagedUsers()
            Object.assign(managedUsers[i], {
              ...uag,
              pagination: {
                users: {
                  limit: userLimit,
                  skip: userSkip,
                  count: userCount,
                },
              },
            })
          }
        }
      }

      return managedUsers
    }

    // =========================================================================

    private async getUagIds(userProfile: UserProfile): Promise<{ id: number }[]> {
      const usrAccessGrps = await this.getUagsByPriority(userProfile)
      let ids: { id: number }[] = []
      for (let i = 0; i < usrAccessGrps.length; i++) {
        const id = usrAccessGrps[i].id
        if (id) ids = [...ids, { id: id }]
      }

      return ids
    }

    private async getUagsByPriority(userProfile: UserProfile): Promise<UserAccessGroup[]> {
      const usrAccesGrps = await this.getUags(userProfile)
      const usrAccessGrp = this.getUsrHighestAccessLevel(usrAccesGrps)
      return this.userAccessGroupRepository.find({
        where: {
          priority: { gt: usrAccessGrp.priority },
        },
      })
    }

    private async getUags(userProfile: UserProfile): Promise<UserAccessGroup[]> {
      const user = await this.userRepository.findById(Number(userProfile[securityId]), {
        include: ['userAccessGroups'],
      })
      if (!user) {
        throw new HttpErrors.NotFound('User not found')
      }

      return user.userAccessGroups
    }

    private getUsrHighestAccessLevel(userAccesGroups: UserAccessGroup[]): UserAccessGroup {
      let highestLevel = 1000
      let accessGrp: UserAccessGroup = userAccesGroups[0]
      for (const item in userAccesGroups) {
        const userAccessGroup = userAccesGroups[item]
        if (userAccessGroup.priority < highestLevel) {
          highestLevel = userAccessGroup.priority
          accessGrp = userAccessGroup
          continue
        }
      }

      return accessGrp
    }
  }
}
