export interface JwtVerifyOptions {
  algorithms?: string[]
  audience?: string | string[]
  complete?: boolean
  issuer?: string | string[]
  jwtid?: string
  ignoreExpiration?: boolean
  subject?: string
}
