import { BindingKey } from '@loopback/core'
import { TokenizerService } from './tokenizer.service'
import { JwtVerifyOptions } from './types'

export namespace TokenizerServiceBindings {
  export namespace Jwt {
    export const v1 = BindingKey.create<TokenizerService.Jwt.v1<JwtVerifyOptions>>('v1.tokenizer.service.jwt.bindings')
  }
}

export namespace TokenizerConstantBindings {
  export namespace Jwt {
    export namespace v1 {
      export namespace AccessToken {
        export const DefaultVerifyOptions = BindingKey.create<JwtVerifyOptions>('tokenizer.v1.access.token.options')
        export const Secret = BindingKey.create<string>('tokenizer.v1.access.token.secret')
        export const ExpiresIn = BindingKey.create<string>('tokenizer.v1.access.token.expires.in.seconds')
        export const Issuer = BindingKey.create<string>('tokenizer.v1.access.token.issuer')
      }
      export namespace RefreshToken {
        export const DefaultVerifyOptions = BindingKey.create<JwtVerifyOptions>('tokenizer.v1.refresh.token.options')
        export const Secret = BindingKey.create<string>('tokenizer.v1.refresh.token.secret')
        export const ExpiresIn = BindingKey.create<string>('tokenizer.v1.refresh.token.expires.in.seconds')
        export const Issuer = BindingKey.create<string>('tokenizer.v1.refresh.token.issuer')
      }
      export namespace PasswordToken {
        export const DefaultVerifyOptions = BindingKey.create<JwtVerifyOptions>('tokenizer.v1.password.token.options')
        export const Secret = BindingKey.create<string>('tokenizer.v1.password.token.secret')
        export const ExpiresIn = BindingKey.create<string>('tokenizer.v1.password.token.expires.in.seconds')
        export const Issuer = BindingKey.create<string>('tokenizer.v1.password.token.issuer')
      }
      export namespace VerificationToken {
        export const DefaultVerifyOptions = BindingKey.create<JwtVerifyOptions>(
          'tokenizer.v1.verification.token.options'
        )
        export const Secret = BindingKey.create<string>('tokenizer.v1.verification.token.secret')
        export const ExpiresIn = BindingKey.create<string>('tokenizer.v1.v.token.expires.in.seconds')
        export const Issuer = BindingKey.create<string>('tokenizer.v1.verification.token.issuer')
      }
    }
  }
}
