import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core'
import { juggler } from '@loopback/repository'
import { DatabaseConfig } from '../configurations/secrets'

const config = {
  name: 'db.cgss_demo',
  connector: 'mysql',
  url: '',
  host: DatabaseConfig.host,
  port: DatabaseConfig.port,
  user: DatabaseConfig.user,
  password: DatabaseConfig.password,
  database: 'cgss_demo',
}

@lifeCycleObserver('datasource')
export class DemoDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = config.name
  static readonly defaultConfig = config

  constructor(
    @inject('datasources.config.cgss_demo', { optional: true })
    dsConfig: object = config
  ) {
    super(dsConfig)
  }
}
