import { BindingKey } from '@loopback/core'
import { EmailerService } from './emailer.service'

export namespace EmailerServiceBindings {
  export namespace Service {
    export const Nodemailer = BindingKey.create<EmailerService>('emailer.service.nodemailer.provider')
  }
}
