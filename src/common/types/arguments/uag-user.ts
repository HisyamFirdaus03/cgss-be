import { UserAccessLevel } from '../../authz'

export interface UagUser {
  uagIdentifier: number | UserAccessLevel.name
  usrId: number
}
