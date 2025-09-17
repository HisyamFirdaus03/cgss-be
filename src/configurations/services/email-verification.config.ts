import { EmailTransporter, Loopback4ServerConfig } from '../secrets'

export namespace EmailVerificationConfig {
  export const required = true
  export const linkUrl = `http://${Loopback4ServerConfig.host}/api/app/verify-email?key=`

  export namespace Sender {
    export const from = `Ghgcope Support <${EmailTransporter.Username}>`
    export const cc = ''
    export const bcc = ''
    export const subject = 'Email verification for ghgcope app'

    export const setHtml = (token: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Email Verification</title>
    </head>
    <body>
      <p>Thank you for registering with us!</p>
      <p>Please click the following link to activate your account</p>
      <a href = "${linkUrl + token}">Verify Account</a>
    </body>
    </html>
    `
  }
}
