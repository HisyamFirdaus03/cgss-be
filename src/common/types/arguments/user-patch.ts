import { model, Model, property } from '@loopback/repository'

@model()
export class UserPatch extends Model {
  @property()
  id?: number
  @property()
  name?: string
  @property()
  username?: string
  @property()
  email?: string
  @property()
  cardId?: string
  @property()
  staffId?: string
}
