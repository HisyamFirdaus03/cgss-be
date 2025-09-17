import { Count, Filter } from '@loopback/repository'
import { UserAccessLevel, UserWithUag, UserWithUagAndUserDetailPagedUser, UserWithUserDetail } from '../../../../common'
import { User } from '../../../../models'

// Service
export namespace UagUsersDomainService {
  export interface v1 {
    byUagCreateUsr(uagIdentifier: number | UserAccessLevel.name, usr: Partial<User>): Promise<UserWithUserDetail>

    byUagFindUsrs(
      uagIdentifier: number | UserAccessLevel.name,
      filter?: Filter<User>
    ): Promise<UserWithUagAndUserDetailPagedUser>

    byUagLinkUsr(uagIdentifier: number | UserAccessLevel.name, usrId: number): Promise<UserWithUag>

    byUagUnlinkUsr(uagIdentifier: number | UserAccessLevel.name, usrId: number): Promise<UserWithUag>

    byUagUnlinkUsrs(uagIdentifier: number | UserAccessLevel.name): Promise<Count>

    byUagReset(): Promise<Count>
  }
}
