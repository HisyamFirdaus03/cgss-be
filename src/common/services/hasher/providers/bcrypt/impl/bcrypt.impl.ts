import { inject } from '@loopback/core'

import { compare, genSalt, hash } from 'bcrypt'
import { HasherConstantBindings } from '../../../hasher-bindings'
import { HasherService } from '../../../hasher-service'

export class BcryptImpl implements HasherService<string> {
  constructor(@inject(HasherConstantBindings.Bcrypt.Rounds) public rounds: number) {}

  async hash(clearTxt: string): Promise<string> {
    const salt = await genSalt(this.rounds)
    return hash(clearTxt, salt)
  }

  async compare(clearTxt: string, hashedTxt: string): Promise<boolean> {
    const matches = await compare(clearTxt, hashedTxt)
    return matches
  }
}
