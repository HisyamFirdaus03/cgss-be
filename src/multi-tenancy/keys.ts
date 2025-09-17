import { BindingKey } from '@loopback/core'
import { Middleware } from '@loopback/rest'
import { Tenant } from './types'

/**
 * export class UserController {
 *   constructor(
 *     @repository(UserRepository)
 *     public userRepository: UserRepository,
 *     @inject(MultiTenancyBindings.CURRENT_TENANT, {optional: true})
 *     private tenant?: Tenant,
 *   ) {}
 */
export namespace MultiTenancyBindings {
  export const MIDDLEWARE = BindingKey.create<Middleware>('middleware.multi-tenancy')
  export const CURRENT_TENANT = BindingKey.create<Tenant>('multi-tenancy.currentTenant')
}

export const MULTI_TENANCY_STRATEGIES = 'multi-tenancy.strategies'
