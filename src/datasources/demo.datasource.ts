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
  
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  maxReconnects: 10,
  reconnectTimeout: 2000,
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  }
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
