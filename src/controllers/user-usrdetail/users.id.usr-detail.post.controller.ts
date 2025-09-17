import { authorize } from '@loopback/authorization'
import { repository } from '@loopback/repository'
import { getModelSchemaRef, HttpErrors, param, post, requestBody } from '@loopback/rest'
import { AuthzBindings, UserAccessLevel } from '../../common'
import { User, UserDetail } from '../../models'
import { UserDetailRepository, UserRepository } from '../../repositories'
import { UserUsrDetailController } from './module'

export class PostUsersIdUsrDetailController {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(UserDetailRepository)
    protected userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0, UserAccessLevel.name.owner_0],
    resource: 'v1.users.id.usr-detail.post',
    scopes: ['patch'],
    voters: [AuthzBindings.Usr.Owner, AuthzBindings.Usr.Rank],
  })
  @post('/v1/users/{id}/usr-detail', {
    'x-controller-name': UserUsrDetailController.controller,
    description: '[`root`|`owner`|`rank`] : Create new `UserDetail` instance for `User.{id}`',
    responses: {
      '200': {
        description: '[`UserDetail`] : model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserDetail),
          },
        },
      },
      '422': {
        description: '[`Error`]: Duplicate entry (one `User` instance can only have one `UserDetail` instance)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number' },
                    name: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async create(
    @param.path.number('id', {
      description: '[`id`] : for `User` instance',
    })
    id: typeof User.prototype.id,
    @requestBody({
      description: '[`UserDetail`] : instance',
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserDetail, {
            exclude: ['id', 'userId'],
          }),
        },
      },
    })
    userDetail: UserDetail
  ): Promise<UserDetail> {
    const counter = await this.userDetailRepository.count({ userId: id })
    if (counter.count > 0) {
      throw new HttpErrors[422]('Duplicate entry')
    }
    return this.userRepository.userDetail(id).create(userDetail)
  }
}
