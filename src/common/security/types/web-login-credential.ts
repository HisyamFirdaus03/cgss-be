import { SchemaObject } from '@loopback/rest'
import { Credential } from '@loopback/security'

export const WebLoginCredentialSchema: SchemaObject = {
  type: 'object',
  properties: {
    usernameOrEmail: { type: 'string' },
    password: { type: 'string' },
  },
  example: {
    usernameOrEmail: 'system@gep.com',
    password: '12345678',
  },
}

export interface WebLoginCredential extends Credential {
  usernameOrEmail: string
  password: string
}
