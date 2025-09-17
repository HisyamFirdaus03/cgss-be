import { Count, Filter, FilterExcludingWhere, Where } from '@loopback/repository'
import {
  UserLogout,
  UserPatch,
  UserWithLoginSession,
  UserWithUagAndUserDetail,
  UserWithUagAndUserDetailPagedUser,
  UserWithUserDetail,
} from '../../../../common'
import { User } from '../../../../models'

export namespace UserDomainService {
  export interface v1 {
    login(usernameOrEmail: string, password: string): Promise<UserWithLoginSession>

    logout(): Promise<UserLogout | null>

    count(where: Where<User>): Promise<Count>

    updateById(id: number, user: Partial<UserPatch>): Promise<UserWithUserDetail>

    deleteById(id: number): Promise<UserWithUagAndUserDetail>

    findById(userId: number, filter?: FilterExcludingWhere<User>): Promise<User>

    find(filter?: Filter<User>): Promise<UserWithUagAndUserDetailPagedUser>

    updateAll(user: Partial<User>, where?: Where<User>): Promise<Count>

    requestResetPassword(emailOrUsername: string): Promise<string>

    resetPasswordById(userId: number, password: string): Promise<string>

    resetPasswordByToken(password: string): Promise<string>

    requestEmailVerificationByCredential(usernameOrEmail: string, password: string): Promise<string>

    requestEmailVerificationById(userId: number): Promise<string>

    verifyEmail(userId?: number): Promise<string>

    deactivate(id: number): Promise<UserWithUserDetail>
    reactivate(id: number): Promise<UserWithUserDetail>
  }
}
