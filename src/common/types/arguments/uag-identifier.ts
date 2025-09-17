import { UserAccessLevel } from '../../authz'

export interface UagIdentifier {
  idOrName: number | UserAccessLevel.name
}
