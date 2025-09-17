import { inject } from '@loopback/core'
import { Count } from '@loopback/repository'
import { UagIdentifier, UseCase } from '../../../../../common'
import { UagUsersDomainService, UagUsersDomainServiceBindings } from '../../services'

export namespace UseUagUserUnlinkUsrs {
  export class v1 implements UseCase<UagIdentifier, Count> {
    constructor(@inject(UagUsersDomainServiceBindings.v1) protected uagUserDomainService: UagUsersDomainService.v1) {}
    async call(params: UagIdentifier): Promise<Count> {
      return this.uagUserDomainService.byUagUnlinkUsrs(params.idOrName)
    }
  }
}
