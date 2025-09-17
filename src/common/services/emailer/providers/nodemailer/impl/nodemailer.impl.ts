import { EmailTransporter } from '../../../../../../configurations/secrets'
import { EmailResetPasswordConfig, EmailVerificationConfig } from '../../../../../../configurations/services'

import * as nodemailer from 'nodemailer'
import { EmailerService } from '../../../emailer.service'

export class NodemailerImpl implements EmailerService {
  async sendEmailVerificationLink(emailTo: string, token: string): Promise<void> {
    const options = {
      from: EmailVerificationConfig.Sender.from,
      to: emailTo,
      cc: EmailVerificationConfig.Sender.cc,
      bcc: EmailVerificationConfig.Sender.bcc,
      subject: EmailVerificationConfig.Sender.subject,
      text: '',
      html: EmailVerificationConfig.Sender.setHtml(token),
    }
    try {
      const res = await NodemailerImpl.getEmailTransporter().sendMail(options)
      console.log('Verification email sent: ', res.response)
    } catch (e) {
      console.error(e)
    }
  }

  async sendResetPasswordLink(emailTo: string, token: string): Promise<void> {
    const options = {
      from: EmailResetPasswordConfig.Sender.from,
      to: emailTo,
      cc: EmailResetPasswordConfig.Sender.cc,
      bcc: EmailResetPasswordConfig.Sender.bcc,
      subject: EmailResetPasswordConfig.Sender.subject,
      text: '',
      html: EmailResetPasswordConfig.Sender.setHtml(token),
    }
    try {
      const res = await NodemailerImpl.getEmailTransporter().sendMail(options)
      console.log('Reset password email sent: ', res.response)
    } catch (e) {
      console.error(e)
    }
  }

  // -------------------------------------------------------------------------//
  private static getEmailTransporter() {
    return nodemailer.createTransport({
      service: EmailTransporter.Service,
      auth: {
        user: EmailTransporter.Username,
        pass: EmailTransporter.Password,
      },
    })
  }
}
