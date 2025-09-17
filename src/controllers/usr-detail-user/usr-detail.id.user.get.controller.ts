import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { repository } from '@loopback/repository'
import { get, getModelSchemaRef, param, RequestContext } from '@loopback/rest'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'
import { omit, reduce } from 'lodash'
import { JwtStrategy, UserAccessLevel, UserWithLoginSession } from '../../common'
import { User, UserDetail } from '../../models'
import { UserDetailRepository, UserRepository } from '../../repositories'
import { UserGroupByMapRepository } from '../../repositories/user-group-by-map.repository'
import { UsrDetailAuthorizerBindings } from '../usr-detail/module'
import { UsrDetailUserController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsrDetailsUserController {
  constructor(
    @repository(UserDetailRepository) public userDetailRepository: UserDetailRepository,
    @inject.context() public context: RequestContext,
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(UserGroupByMapRepository) private userGroupByMapRepository: UserGroupByMapRepository
  ) { }

  @authorize({
    allowedRoles: [UserAccessLevel.name.owner_0, UserAccessLevel.name.rank_0],
    resource: 'v1.usr-details.id.get',
    scopes: ['get'],
    voters: [UsrDetailAuthorizerBindings.Owner, UsrDetailAuthorizerBindings.Rank],
  })
  @get('/v1/usr-details/{id}/user', {
    'x-controller-name': UsrDetailUserController.controller,
    description: '[`root`|`owner`|`rank`] : Get `User` of `UserDetail`',
    responses: {
      '200': {
        description: '[`User`] : belonging to UserDetail',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {
                exclude: ['password', 'verificationToken', 'resetPwdToken'],
              }),
            },
          },
        },
      },
    },
  })
  async getUser(@param.path.number('id', { description: '[`id`] : of `UserDetail`' }) id: typeof UserDetail.prototype.id): Promise<User> {
    return this.userDetailRepository.user(id)
  }

  @get('/v1/me', {
    'x-controller-name': UsrDetailUserController.controller,
    description: 'whoami',
    responses: {
      '200': {
        description: '[`User`] : whoami',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {
                exclude: ['password', 'verificationToken', 'resetPwdToken'],
              }),
            },
          },
        },
      },
    },
  })
  async getMe(): Promise<Omit<User, 'userAccessGroups'> & {
    priority?: number;
    roles: string[];
    permissions: string[];
    groupByIds: number[]
  }> {
    const currentUser = await this.userRepository.findById(+this.user[securityId], {
      fields: ['id', 'name', 'username', 'email'],
      include: [
        {
          relation: 'userDetail',
          scope: { fields: ['phoneNumber', 'picture', 'address1', 'address2'] },
        },
        {
          relation: 'userAccessGroups',
          scope: { fields: ['name', 'priority'], include: [{ relation: 'permissions', scope: { fields: ['name'] } }] },
        },
      ],
    })

    // @ts-ignore
    currentUser.priority = reduce(
      currentUser?.userAccessGroups ?? [],
      (acc, c) => {
        acc = Math.min(acc, c.priority)
        return acc
      },
      Number.MAX_SAFE_INTEGER
    )

    // const roles = (currentUser.userAccessGroups ?? []).map((g) => g.name)
    const permissions = Array.from(
      new Set(
        (currentUser.userAccessGroups ?? []).flatMap((g: any) => (g.permissions ?? []).map((p: any) => p.name))
      )
    )

    const mappings = await this.userGroupByMapRepository.find({ where: { userId: +this.user[securityId] } })
    const groupByIds = mappings.map((m) => m.groupById!).filter((v) => typeof v === 'number') as number[]

    const result = omit({
      ...currentUser,
      groupByIds,
      permissions,
    }, [
      'userAccessGroups',
      // @ts-ignore: 3 === priority.adminCompany
      currentUser.priority > 3 ? 'priority' : '',
    ].filter(_ => Boolean(_))) as Omit<User, 'userAccessGroups'> & {
      priority?: number
      roles: string[]
      permissions: string[]
      groupByIds: number[]
    }

    return result
  }

  @get('/v1/whoami', {
    'x-controller-name': UsrDetailUserController.controller,
    description: 'whoami',
    responses: {
      '200': {
        description: '[`User`] : whoami',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {
                exclude: ['password', 'verificationToken', 'resetPwdToken'],
              }),
            },
          },
        },
      },
    },
  })
  async whoami() {
    return this.userRepository.findOne({
      where: {
        id: +this.user[securityId],
      },
      fields: UserWithLoginSession.exclusions.getUserExclusions(),
      include: [
        {
          relation: 'userDetail',
          scope: {
            fields: UserWithLoginSession.exclusions.getUserDetailExclusions(),
          },
        },
        {
          relation: 'userAccessGroups',
          scope: {
            fields: UserWithLoginSession.exclusions.getUserAccessGroupExclusions(),
          },
        },
      ],
    })
  }
}
