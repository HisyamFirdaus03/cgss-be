import { inject } from '@loopback/core'
import { DefaultCrudRepository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { UserToken, UserTokenRelations } from '../models'
import { DatabaseConfig } from '../configurations/secrets'

export class UserTokenRepository extends DefaultCrudRepository<UserToken, typeof UserToken.prototype.id, UserTokenRelations> {
  constructor(@inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource) {
    super(UserToken, dataSource)
  }
}
