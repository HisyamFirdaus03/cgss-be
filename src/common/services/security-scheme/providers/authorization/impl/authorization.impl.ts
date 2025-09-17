import { Request } from '@loopback/rest'
import { SecuritySchemeService } from '../../../security-scheme.service'

export namespace AuthorizationImpl {
  export class v1 implements SecuritySchemeService.v1 {
    async extractToken(request: Request): Promise<string | null> {
      if (!request.headers.authorization) {
        return null
      }
      if (request.headers.authorization !== undefined) {
        const authHeaderValue = request.headers.authorization
        if (!authHeaderValue.startsWith('Bearer')) {
          return authHeaderValue
        }
      }

      return null
    }
  }
}
