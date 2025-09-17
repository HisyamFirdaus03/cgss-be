import { inject } from '@loopback/core'
import { Count } from '@loopback/repository'
import { UseCase } from '../../../../../common'
import { UagUsersDomainService, UagUsersDomainServiceBindings } from '../../services'

export namespace UseUagUserReset {
  export class v1 implements UseCase<void, Count> {
    constructor(
      @inject(UagUsersDomainServiceBindings.v1)
      protected uagUserDomainService: UagUsersDomainService.v1
    ) {}
    async call(): Promise<Count> {
      return this.uagUserDomainService.byUagReset()
    }
  }
}
