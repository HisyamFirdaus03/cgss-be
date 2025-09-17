import { User, UserAccessGroup, UserDetail } from '../../models'
import { exclusionListToObject } from './exclusion-list-to-object'

export class FieldExclusions {
  user: (keyof User)[]
  userDetail: (keyof UserDetail)[]
  userAccessGroup: (keyof UserAccessGroup)[]

  constructor(fields: {
    user?: (keyof User)[]
    userDetail?: (keyof UserDetail)[]
    userAccessGroup?: (keyof UserAccessGroup)[]
  }) {
    this.user = fields.user ?? ['password', 'verificationToken', 'resetPwdToken']
    this.userDetail = fields.userDetail ?? []
    this.userAccessGroup = fields.userAccessGroup ?? []
  }

  getUserExclusions = (): object => {
    return exclusionListToObject(this.user as string[])
  }
  getUserDetailExclusions = (): object => {
    return exclusionListToObject(this.userDetail as string[])
  }
  getUserAccessGroupExclusions = (): object => {
    return exclusionListToObject(this.userAccessGroup as string[])
  }
}
