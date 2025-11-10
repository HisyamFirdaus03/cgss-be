import { LoopbackJwtCasbinBasic } from '../../application'
import { HasherServiceBindings, UserAccessLevel } from '../../common'
import { UserUagServiceBindings } from '../../controllers/user-uag/module'
import { User, UserDetail } from '../../models'
import { UserAccessGroupRepository, UserRepository } from '../../repositories'

const UserAccessGroupInstances = {
  [UserAccessLevel.name.root]: {
    name: UserAccessLevel.name.root,
    description: 'System administrator with all access',
    priority: UserAccessLevel.priority.root,
  },
  [UserAccessLevel.name.adminGHGGate]: {
    name: UserAccessLevel.name.adminGHGGate,
    description: 'GHG Gate Superadmin - Global access across all tenants, manage emission factors',
    priority: UserAccessLevel.priority.adminGHGGate,
  },
  [UserAccessLevel.name.adminSystem]: {
    name: UserAccessLevel.name.adminSystem,
    description: 'Admin system-level access',
    priority: UserAccessLevel.priority.adminSystem,
  },
  [UserAccessLevel.name.adminHQ]: {
    name: UserAccessLevel.name.adminHQ,
    description: 'HQ Admin - Full control over HQ and all subsidiaries, can create subsidiary users',
    priority: UserAccessLevel.priority.adminHQ,
  },
  [UserAccessLevel.name.adminCompany]: {
    name: UserAccessLevel.name.adminCompany,
    description: 'Admin company-level access',
    priority: UserAccessLevel.priority.adminCompany,
  },
  [UserAccessLevel.name.adminSubsidiary]: {
    name: UserAccessLevel.name.adminSubsidiary,
    description: 'Subsidiary Admin - Can only view/edit own subsidiary, no sibling access',
    priority: UserAccessLevel.priority.adminSubsidiary,
  },
  [UserAccessLevel.name.member]: {
    name: UserAccessLevel.name.member,
    description: 'Member level access',
    priority: UserAccessLevel.priority.member,
  },
  [UserAccessLevel.name.guest]: {
    name: UserAccessLevel.name.guest,
    description: 'Guest level access - Read-only',
    priority: UserAccessLevel.priority.guest,
  },
  ////////////////////////////////////////////////////

  [UserAccessLevel.name.owner_0]: {
    name: UserAccessLevel.name.owner_0,
    description: 'Resource owner',
    priority: UserAccessLevel.priority.owner_0,
  },
  [UserAccessLevel.name.anonymous]: {
    name: UserAccessLevel.name.anonymous,
    description: 'Unauthenticated user',
    priority: UserAccessLevel.priority.anonymous,
  },
  [UserAccessLevel.name.none]: {
    name: UserAccessLevel.name.none,
    description: 'Nobody except root',
    priority: UserAccessLevel.priority.none,
  },
}

export const _groups = [
  UserAccessGroupInstances[UserAccessLevel.name.root],
  UserAccessGroupInstances[UserAccessLevel.name.adminGHGGate],
  UserAccessGroupInstances[UserAccessLevel.name.adminSystem],
  UserAccessGroupInstances[UserAccessLevel.name.adminHQ],
  UserAccessGroupInstances[UserAccessLevel.name.adminCompany],
  UserAccessGroupInstances[UserAccessLevel.name.adminSubsidiary],
  UserAccessGroupInstances[UserAccessLevel.name.member],
  UserAccessGroupInstances[UserAccessLevel.name.guest],
  // Scope-specific groups
  {
    name: 'scope1-admin',
    description: 'Scope 1 Administrator access',
    priority: 5,
  },
  {
    name: 'scope2-admin',
    description: 'Scope 2 Administrator access',
    priority: 5,
  },
  {
    name: 'scope3-admin',
    description: 'Scope 3 Administrator access',
    priority: 5,
  },
  {
    name: 'scope1-viewer',
    description: 'Scope 1 Viewer access',
    priority: 6,
  },
  {
    name: 'scope2-viewer',
    description: 'Scope 2 Viewer access',
    priority: 6,
  },
  {
    name: 'scope3-viewer',
    description: 'Scope 3 Viewer access',
    priority: 6,
  },
  {
    name: 'emission-production-admin',
    description: 'Emission Production Administrator access',
    priority: 5,
  },
  {
    name: 'emission-production-viewer',
    description: 'Emission Production Viewer access',
    priority: 6,
  },
]

const p = '12345678'
export const _users: {
  user: Partial<User>
  groups: string[]
  detail: Partial<UserDetail>
}[] = [
    {
      user: {
        name: 'System Root',
        username: 'system_root',
        email: 'system@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: [UserAccessLevel.name.root, 'scope1-admin', 'scope2-admin', 'scope3-admin', 'emission-production-admin'],
      detail: { phoneNumber: '+6012-3456789' },
    },
    {
      user: {
        name: 'System Admin',
        username: 'system_admin',
        email: 'system_admin@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: [UserAccessLevel.name.adminSystem, 'scope1-admin', 'scope2-admin', 'scope3-admin', 'emission-production-admin'],
      detail: { phoneNumber: '+698-7654321' },
    },
    {
      user: {
        name: 'Admin Company',
        username: 'system_company',
        email: 'system_company@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: [UserAccessLevel.name.adminCompany, 'scope1-admin', 'scope2-admin', 'scope3-admin', 'emission-production-admin'],
      detail: { phoneNumber: '+698-7654321' },
    },
    {
      user: {
        name: 'Member',
        username: 'member',
        email: 'member@ghgcope.com',
        password: p,
        emailVerified: false,
      },
      groups: [UserAccessLevel.name.member],
      detail: { phoneNumber: '+607-5479416' },
    },
    {
      user: {
        name: 'Guest@01',
        email: 'guest@ghgcope.com',
        password: p,
        emailVerified: false,
      },
      groups: [UserAccessLevel.name.guest],
      detail: { phoneNumber: '+607-5479417' },
    },

    // Scope-specific Admin Users
    {
      user: {
        name: 'Scope 1 Administrator',
        username: 'scope1',
        email: 'scope1@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: ['scope1-admin', 'scope2-viewer', 'scope3-viewer', 'emission-production-viewer'],
      detail: { phoneNumber: '+607-1001001' },
    },
    {
      user: {
        name: 'Scope 2 Administrator',
        username: 'scope2',
        email: 'scope2@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: ['scope2-admin', 'scope1-viewer', 'scope3-viewer', 'emission-production-viewer'],
      detail: { phoneNumber: '+607-2002002' },
    },
    {
      user: {
        name: 'Scope 3 Administrator',
        username: 'scope3',
        email: 'scope3@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: ['scope3-admin', 'scope1-viewer', 'scope2-viewer', 'emission-production-viewer'],
      detail: { phoneNumber: '+607-3003003' },
    },
    {
      user: {
        name: 'Emission Production Administrator',
        username: 'ep',
        email: 'ep@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: ['emission-production-admin', 'scope1-viewer', 'scope2-viewer', 'scope3-viewer'],
      detail: { phoneNumber: '+607-4004004' },
    },

    // NEW: Hierarchy-aware roles
    {
      user: {
        name: 'GHG Gate Superadmin',
        username: 'ghg_admin',
        email: 'ghg_admin@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: [UserAccessLevel.name.adminGHGGate, 'scope1-admin', 'scope2-admin', 'scope3-admin', 'emission-production-admin'],
      detail: { phoneNumber: '+607-5005005' },
    },
    {
      user: {
        name: 'HQ Administrator',
        username: 'hq_admin',
        email: 'hq_admin@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: [UserAccessLevel.name.adminHQ, 'scope1-admin', 'scope2-admin', 'scope3-admin', 'emission-production-admin'],
      detail: { phoneNumber: '+607-6006006' },
    },
    {
      user: {
        name: 'Subsidiary Administrator',
        username: 'sub_admin',
        email: 'sub_admin@ghgcope.com',
        password: p,
        emailVerified: true,
      },
      groups: [UserAccessLevel.name.adminSubsidiary, 'scope1-admin', 'scope2-admin', 'scope3-admin', 'emission-production-admin'],
      detail: { phoneNumber: '+607-7007007' },
    },
  ]

export const seedGeneral = async (app: LoopbackJwtCasbinBasic) => {
  const bcryptService = await app.get(HasherServiceBindings.Service.Bcrypt)
  const userApi = await app.get(UserUagServiceBindings.v1)
  const groupRepo = await app.getRepository(UserAccessGroupRepository)
  const userRepo = await app.getRepository(UserRepository)

  // create GROUP
  for (const ugrp of _groups) await groupRepo.create(ugrp)

  // create USER and attach GROUP
  for (const usr of _users) {
    const pwd = await bcryptService.hash(usr.user.password!)
    const user = await userRepo.create(Object.assign(usr.user, { password: pwd }))

    await userRepo.userDetail(user.id).create(usr.detail)

    for (const grpName of usr.groups) {
      await userApi.linkByUserAccessGroupName(user.id, grpName)
    }
  }

  console.log('Done: User')
}
