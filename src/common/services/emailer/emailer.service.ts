export interface EmailerService {
  sendEmailVerificationLink(emailAddress: string, token: string): Promise<void>
  sendResetPasswordLink(emailAddress: string, token: string): Promise<void>
}
