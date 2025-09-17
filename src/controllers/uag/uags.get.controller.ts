import { authenticate } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { Filter } from '@loopback/repository'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { JwtStrategy } from '../../common'
import { UagWithUserPagedUsers } from '../../common'
import { UserAccessGroup } from '../../models'
import { UagControllerUseCasesBindings, UserAccessGroupsController, UseUagGetManagedUags } from './module'

const { v1, controller } = UserAccessGroupsController

@authenticate(JwtStrategy.UserAccessToken)
export class Uags_GetController {
  constructor(
    @inject(UagControllerUseCasesBindings.v1.UseUagGetManagedUags)
    protected v1_UseUagGetManagedUags: UseUagGetManagedUags.v1
  ) {}

  @get(v1.uag.path, {
    'x-controller-name': controller,
    description:
      '**[`token`]** : ' +
      'Find `UserAccessGroup` with lower rank than the current `User` ' +
      'Must provide a valid token in the request header. ',
    responses: {
      '200': {
        description: '[`UagWithUserPagedUsers`] : List of `UserAccessGroup` with optional paginated `User`',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UagWithUserPagedUsers),
            },
          },
        },
      },
    },
  })
  async [v1.uag.get.fn](
    @param.filter(UserAccessGroup) filter?: Filter<UserAccessGroup>
  ): Promise<UagWithUserPagedUsers[]> {
    return this.v1_UseUagGetManagedUags.call(filter)
  }
}
