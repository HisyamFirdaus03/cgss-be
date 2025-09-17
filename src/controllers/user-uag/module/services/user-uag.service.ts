import { UserAccessGroup } from '../../../../models'

export namespace UserUagService {
  export interface v1 {
    findUserAccessGroupsByUserId(userId?: number): Promise<UserAccessGroup[]>

    linkByUserAccessGroupId(userId?: number, groupId?: number): Promise<UserAccessGroup[]>

    linkByUserAccessGroupName(userId?: number, name?: string): Promise<UserAccessGroup[]>

    unlinkByUserAccessGroupId(userId?: number, groupId?: number): Promise<UserAccessGroup[]>

    unlinkByUserAccessGroupName(userId?: number, name?: string): Promise<UserAccessGroup[]>

    unlinkFromAllUserAccessGroups(userId?: number): Promise<UserAccessGroup[]>
  }
}
