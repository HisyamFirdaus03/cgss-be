import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Filter, repository } from '@loopback/repository'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { User, UserDetail } from '../../models'
import { UserDetailRepository, UserRepository } from '../../repositories'
import { UserUsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsersIdUsrDetailController {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(UserDetailRepository)
    protected userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0, UserAccessLevel.name.owner_0],
    resource: 'v1.users.id.usr-detail.get',
    scopes: ['del'],
    voters: [AuthzBindings.Usr.Owner, AuthzBindings.Usr.Rank],
  })
  @get('/v1/users/{id}/usr-detail', {
    'x-controller-name': UserUsrDetailController.controller,
    description: '[`root`|`owner`|`rank`] : Get `UserDetail` for `User` by `User.id` ',
    responses: {
      '200': {
        description: "`User`'s `UserDetail` instance",
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserDetail),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id', {
      description: '[`id`] : of the `User`',
    })
    id: number,
    @param.filter(User) filter?: Filter<UserDetail>
  ): Promise<UserDetail> {
    return this.userRepository.userDetail(id).get(filter)
  }
}
