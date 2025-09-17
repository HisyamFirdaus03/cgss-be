import { Request } from '@loopback/rest'
import { SecuritySchemeService } from '../../../security-scheme.service'

export namespace AccessTokenImpl {
  export class v1 implements SecuritySchemeService.v1 {
    async extractToken(request: Request): Promise<string | null> {
      if (!request.headers.access_token) {
        return null
      }
      if (request.headers.access_token !== undefined) {
        const authHeaderValue = request.headers.access_token as string
        return authHeaderValue
      }

      return null
    }
  }
}
