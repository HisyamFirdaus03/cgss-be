import { BindingKey } from '@loopback/core'
import { UseCase, UserUagId, UserUagName } from '../../../../common'
import { UserAccessGroup } from '../../../../models'

export namespace UserUagControllerUseCasesBindings {
  export namespace v1 {
    export const UseUserUagUnlinkByUagName = BindingKey.create<UseCase<UserUagName, UserAccessGroup[]>>(
      'v1.use.case.user-uag.unlink-by-uag-name'
    )

    export const UseUserUagLinkByUagName = BindingKey.create<UseCase<UserUagName, UserAccessGroup[]>>(
      'v1.use.case.user-uag.link-by-uag-name'
    )

    export const UseUserUagUnlinkAllByUagName = BindingKey.create<UseCase<number, UserAccessGroup[]>>(
      'v1.use.case.user-uag.unlink-all-by-uag-name'
    )

    export const UseUserUagFind = BindingKey.create<UseCase<number, UserAccessGroup[]>>('v1.use.case.user-uag.find')

    export const UseUserUagLinkByUagId = BindingKey.create<UseCase<UserUagId, UserAccessGroup[]>>(
      'v1.use.case.user-uag.link-by-uag-id'
    )

    export const UseUserUagUnlinkByUagId = BindingKey.create<UseCase<UserUagId, UserAccessGroup[]>>(
      'v1.use.case.user-uag.unlink-by-uag-id'
    )
  }
}
