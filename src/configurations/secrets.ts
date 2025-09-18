import 'dotenv/config'

export namespace EmailTransporter {
  export const Service = process.env.NODEMAILER_SERVICE as string
  export const Username = process.env.NODEMAILER_USERNAME as string
  export const Password = process.env.NODEMAILER_PASSWORD as string
}

export namespace JwtUserAccessConfig {
  export const Secret = process.env.JWT_USER_ACCESS_SECRET as string
  export const ExpiresIn = process.env.JWT_USER_ACCESS_EXPIRES_IN as string
  export const Scope = process.env.JWT_USER_ACCESS_SCOPE as string
  export const Issuer = process.env.JWT_USER_ACCESS_ISSUER as string
}

export namespace JwtUserRefreshConfig {
  export const Secret = process.env.JWT_USER_REFRESH_SECRET as string
  export const ExpiresIn = process.env.JWT_USER_REFRESH_EXPIRES_IN as string
  export const Scope = process.env.JWT_USER_REFRESH_SCOPE as string
  export const Issuer = process.env.JWT_USER_REFRESH_ISSUER as string
}

export namespace JwtUserPasswordConfig {
  export const Secret = process.env.JWT_USER_PASSWORD_SECRET as string
  export const ExpiresIn = process.env.JWT_USER_PASSWORD_EXPIRES_IN as string
  export const Scope = process.env.JWT_USER_PASSWORD_SCOPE as string
  export const Issuer = process.env.JWT_USER_PASSWORD_ISSUER as string
}

export namespace JwtUserVerificationConfig {
  export const Secret = process.env.JWT_USER_VERIFICATION_SECRET as string
  export const ExpiresIn = process.env.JWT_USER_VERIFICATION_EXPIRES_IN as string
  export const Scope = process.env.JWT_USER_VERIFICATION_SCOPE as string
  export const Issuer = process.env.JWT_USER_VERIFICATION_ISSUER as string
}

export namespace DatabaseConfig {
  export const host = process.env.DATABASE_HOST as string
  export const port = parseInt(process.env.DATABASE_PORT || '3306', 10)
  export const user = process.env.DATABASE_USER as string
  export const password = process.env.DATABASE_PASSWORD as string
  export const DATABASE_LB4_PATH = process.env.DATABASE_LB4_PATH as string
}

export namespace Loopback4ServerConfig {
  export const port = +(process.env.CGSS_BE_PORT ?? 4000)
  export const host = process.env.CGSS_HOST === 'null' ? null : process.env.CGSS_HOST
}

export namespace EnvConfig {
  export const isDev = process.env.NODE_ENV === 'development'
  export const isProd = !isDev
}
