import { HttpErrors, Request } from '@loopback/rest'
import { SecuritySchemeService } from '../../../security-scheme.service'

export namespace BearerImpl {
  export class v1 implements SecuritySchemeService.v1 {
    async extractToken(request: Request): Promise<string | null> {
      if (!request.headers.authorization) {
        return null
      }
      if (request.headers.authorization !== undefined) {
        // authorization : Bearer xxx.yyy.zzz
        const authHeaderValue = request.headers.authorization
        if (authHeaderValue.startsWith('Bearer')) {
          //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
          const parts = authHeaderValue.split(' ')
          if (parts.length !== 2)
            throw new HttpErrors.Unauthorized(
              'Authorization header value has too many parts. ' +
                "It must follow the pattern: 'Bearer xx.yy.zz' " +
                'where xx.yy.zz is a valid JWT token.'
            )
          const token = parts[1]
          return token
        }
      }

      return null
    }
  }
}
