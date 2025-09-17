import { UserWithLoginSession, UserWithUagAndUserDetail } from '../../../../common'
// Service
export namespace RefreshTokenDomainService {
  export interface v1 {
    getTokenOwner(): Promise<UserWithUagAndUserDetail>
    refreshAccessToken(): Promise<UserWithLoginSession>
  }
}
