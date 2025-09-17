import { Request } from '@loopback/rest'

export namespace SecuritySchemeService {
  export interface v1 {
    extractToken(request: Request): Promise<string | null>
  }
}
