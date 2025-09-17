import { EmailTransporter, Loopback4ServerConfig } from '../secrets'

export namespace EmailResetPasswordConfig {
  export const linkUrl = `http://${Loopback4ServerConfig.host}/api/app/reset-password?key=`

  export namespace Sender {
    export const from = `Ghgcope Support <${EmailTransporter.Username}>`
    export const cc = ''
    export const bcc = ''
    export const subject = 'Reset password for ghgcope app'

    export const setHtml = (token: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Password</title>
    </head>
    <body>
      <p>You have requested to reset your password. Please ignore this email if its not you.</p>
      <p>Please click the following link to reset your password</p>
      <a href = "${linkUrl + token}">Reset Password</a>
    </body>
    </html>
    `
  }
}
