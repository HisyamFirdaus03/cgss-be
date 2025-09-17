import { inject } from '@loopback/core'
import { DefaultCrudRepository, juggler } from '@loopback/repository'
import { MainDatasource } from '../datasources'
import { CompanyInfo, CompanyInfoRelations } from '../models'
import { get as _get } from 'lodash'
import { DatabaseConfig } from '../configurations/secrets'
import DataSource = juggler.DataSource

export class CompanyInfoRepository extends DefaultCrudRepository<CompanyInfo, typeof CompanyInfo.prototype.id, CompanyInfoRelations> {
  constructor(@inject('datasources.db.cgss__main') dataSource: MainDatasource) {
    super(CompanyInfo, dataSource)
  }

  async getMaxGroups(companySlug: string) {
    const companyInfo = await this.find({ where: { slug: companySlug }, fields: ['slug', 'metadata'] })
    return _get(companyInfo[0], 'metadata.maxGroups', Number.MAX_SAFE_INTEGER) as number
  }

  async getFinancialYearStartMonth(companySlug: string) {
    const companyInfo = await this.find({where: {slug: companySlug}, fields: ['slug', 'metadata']})
    return _get(companyInfo[0], 'metadata.financialYearStartMonth', 1) as CompanyInfo['metadata']['financialYearStartMonth']
  }

  async connectDBs(): Promise<DataSource[]> {
    const companyInfos: CompanyInfo[] = await this.find({ where: { status: 'active' }, fields: ['slug'] })

    const dbNames = companyInfos.map(({ slug }) => ({
      database: `cgss_${slug}`,
      name: `db.cgss_${slug}`,
      connector: 'mysql',
    }))

    return dbNames.map((i) => {
      const ds = new juggler.DataSource({
        ...i,
        url: '',
        host: DatabaseConfig.host,
        port: DatabaseConfig.port,
        user: DatabaseConfig.user,
        password: DatabaseConfig.password,
      })
      ds.connect()

      return ds as DataSource
    })
  }
}
