import { BindingKey } from '@loopback/core'
import { Filter } from '@loopback/repository'
import { UseCase } from '../../../../common'
import { UagWithUserPagedUsers } from '../../../../common'
import { UserAccessGroup } from '../../../../models'

// Bindings
export namespace UagControllerUseCasesBindings {
  export namespace v1 {
    export const UseUagGetManagedUags = BindingKey.create<UseCase<Filter<UserAccessGroup>, UagWithUserPagedUsers[]>>(
      'v1.use.case.uag.get.managed.uags'
    )
  }
}
