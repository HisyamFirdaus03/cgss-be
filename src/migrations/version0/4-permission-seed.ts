import { LoopbackJwtCasbinBasic } from '../../application'
import { PermissionRepository, UserAccessGroupRepository } from '../../repositories'
import { Permission } from '../../models'
import { UserAccessLevel } from '../../common'

const scope1Modules = [
  'stationary-combustion',
  'mobile-combustion',
  'fugitive-emission',
  'processes-emission',
] as const
const scope2Modules = ['scope2'] as const
const scope3Modules = [
  'employee-commuting',
  'business-travel',
  'upstream-downstream-transportation-and-distribution',
  'waste-generated',
  // add more when available
]
const emissionProductionModules = ['emission-production', 'emission-production-activity'] as const

const verbs = ['create', 'update', 'delete', 'view'] as const

function buildPermissions(): Permission[] {
  const perms: Permission[] = []
  for (const m of scope1Modules) for (const v of verbs) perms.push(new Permission({ name: `scope1.${m}.${v}` }))
  for (const m of scope2Modules) for (const v of verbs) perms.push(new Permission({ name: `scope2.${m}.${v}` }))
  for (const m of scope3Modules) for (const v of verbs) perms.push(new Permission({ name: `scope3.${m}.${v}` }))
  for (const m of emissionProductionModules) for (const v of verbs) perms.push(new Permission({ name: `${m}.${v}` }))
  return perms
}

export async function seedPermissions(app: LoopbackJwtCasbinBasic) {
  const permRepo = await app.getRepository(PermissionRepository)
  const uagRepo = await app.getRepository(UserAccessGroupRepository)

  const toCreate = buildPermissions()

  // idempotent creation
  for (const p of toCreate) {
    const exists = await permRepo.findOne({ where: { name: p.name } })
    if (!exists) await permRepo.create(p)
  }

  const allPerms = await permRepo.find()
  const byPrefix = (prefix: string) => allPerms.filter((p) => p.name.startsWith(prefix))
  const only = (prefix: string, operations: string[]) =>
    allPerms.filter((p) => p.name.startsWith(prefix) && operations.includes(p.name.split('.').pop()!))

  const root = await uagRepo.findOne({ where: { name: UserAccessLevel.name.root } })
  const adminSystem = await uagRepo.findOne({ where: { name: UserAccessLevel.name.adminSystem } })
  const adminCompany = await uagRepo.findOne({ where: { name: UserAccessLevel.name.adminCompany } })
  const member = await uagRepo.findOne({ where: { name: UserAccessLevel.name.member } })
  const guest = await uagRepo.findOne({ where: { name: UserAccessLevel.name.guest } })

  async function grantAll(uagId?: number) {
    if (!uagId) return
    for (const p of allPerms) await uagRepo.permissions(uagId).link(p.id!)
  }

  async function grantViewOnly(uagId?: number) {
    if (!uagId) return
    for (const p of allPerms) if (p.name.endsWith('.view')) await uagRepo.permissions(uagId).link(p.id!)
  }

  // Grant all to admin tiers
  await grantAll(root?.id)
  await grantAll(adminSystem?.id)
  await grantAll(adminCompany?.id)

  // Default members/guests can view everything
  await grantViewOnly(member?.id)
  await grantViewOnly(guest?.id)

  // Link permissions to existing roles
  const scopeAdmins = [
    { name: 'scope1-admin', prefix: 'scope1.' },
    { name: 'scope2-admin', prefix: 'scope2.' },
    { name: 'scope3-admin', prefix: 'scope3.' },
    { name: 'emission-production-admin', prefix: 'emission-production.' },
  ]
  for (const sa of scopeAdmins) {
    const uag = await uagRepo.findOne({ where: { name: sa.name } })
    if (uag) {
      for (const p of byPrefix(sa.prefix)) await uagRepo.permissions(uag.id!).link(p.id!)
    }
  }

  // Link view-only permissions to existing roles
  const scopeViewers = [
    { name: 'scope1-viewer', prefix: 'scope1.' },
    { name: 'scope2-viewer', prefix: 'scope2.' },
    { name: 'scope3-viewer', prefix: 'scope3.' },
    { name: 'emission-production-viewer', prefix: 'emission-production.' },
  ]
  for (const sv of scopeViewers) {
    const uag = await uagRepo.findOne({ where: { name: sv.name } })
    if (uag) {
      for (const p of only(sv.prefix, ['view'])) await uagRepo.permissions(uag.id!).link(p.id!)
    }
  }

  console.log('Done: Permissions seeded')
}


