import { Binding, Component } from '@loopback/core'
import {
  JwtUserAccessConfig,
  JwtUserPasswordConfig,
  JwtUserRefreshConfig,
  JwtUserVerificationConfig,
} from '../../../../../configurations/secrets'
import { TokenizerConstantBindings, TokenizerServiceBindings } from '../../tokenizer.bindings'
import { JwtImpl } from './impl'

export class JwtComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(TokenizerServiceBindings.Jwt.v1).toClass(JwtImpl.v1),

    Binding.bind(TokenizerConstantBindings.Jwt.v1.AccessToken.DefaultVerifyOptions).to({ ignoreExpiration: false }),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.AccessToken.ExpiresIn).to(JwtUserAccessConfig.ExpiresIn),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.AccessToken.Issuer).to(JwtUserAccessConfig.Issuer),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.AccessToken.Secret).to(JwtUserAccessConfig.Secret),

    Binding.bind(TokenizerConstantBindings.Jwt.v1.PasswordToken.DefaultVerifyOptions).to({ ignoreExpiration: false }),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.PasswordToken.ExpiresIn).to(JwtUserPasswordConfig.ExpiresIn),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.PasswordToken.Issuer).to(JwtUserPasswordConfig.Issuer),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.PasswordToken.Secret).to(JwtUserPasswordConfig.Secret),

    Binding.bind(TokenizerConstantBindings.Jwt.v1.RefreshToken.DefaultVerifyOptions).to({ ignoreExpiration: false }),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.RefreshToken.ExpiresIn).to(JwtUserRefreshConfig.ExpiresIn),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.RefreshToken.Issuer).to(JwtUserRefreshConfig.Issuer),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.RefreshToken.Secret).to(JwtUserRefreshConfig.Secret),

    // prettier-ignore
    Binding.bind(TokenizerConstantBindings.Jwt.v1.VerificationToken.DefaultVerifyOptions).to({ignoreExpiration: false,}),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.VerificationToken.ExpiresIn).to(JwtUserVerificationConfig.ExpiresIn),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.VerificationToken.Issuer).to(JwtUserVerificationConfig.Issuer),
    Binding.bind(TokenizerConstantBindings.Jwt.v1.VerificationToken.Secret).to(JwtUserVerificationConfig.Secret),
  ]
}
