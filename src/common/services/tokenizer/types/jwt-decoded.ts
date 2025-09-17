export type JwtDecoded = {
  header: {
    alg: string
    type: string
  }
  payload: {
    securityId: string
    name: string
    email: string
    iat: number
    exp: number
    [key: string]: any
  }
  signature: string
  [key: string]: any
}
