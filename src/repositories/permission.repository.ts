import { inject } from '@loopback/core'
import { DefaultCrudRepository } from '@loopback/repository'
import { DatabaseConfig } from '../configurations/secrets'
import { DemoDataSource } from '../datasources'
import { Permission, PermissionRelations } from '../models'

export class PermissionRepository extends DefaultCrudRepository<
  Permission,
  typeof Permission.prototype.id,
  PermissionRelations
> {
  constructor(@inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource) {
    super(Permission, dataSource)
  }
}


