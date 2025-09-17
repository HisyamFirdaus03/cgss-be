export interface JwtSignOptions {
  algorithms?: string
  expiresIn?: number | string
  notBefore?: number | string
  audience?: string
  issuer?: string
  jwtid?: number | string
  subject?: string
  noTimestamp?: boolean
  header?: string
  keyid?: string
  mutatePayload?: boolean
  allowInsecureKeySizes?: boolean
  allowInvalidAsymmetricKeyTypes?: boolean
}
