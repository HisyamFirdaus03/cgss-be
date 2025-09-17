import { cronJob, CronJob } from '@loopback/cron'
import { EnvConfig, Loopback4ServerConfig } from '../configurations/secrets'
import { repository } from '@loopback/repository'
import { CompanyInfoRepository } from '../repositories'
import { CompanyInfo } from '../models'

@cronJob()
export class CronEmployeeCommutingActivities extends CronJob {
  constructor(
    @repository(CompanyInfoRepository)
    private companyInfoRepo: CompanyInfoRepository
  ) {
    super({
      name: 'CronEmployeeCommutingActivities',
      start: true, // Start the job immediately
      cronTime: EnvConfig.isDev
        ?
        // '* * * * *' // for debugging, Every min
        '0 2 * * 1'
        : '0 2 * * 1', // 2 AM every 2nd day of the week (Monday):
      onTick: async () => {
        const companyInfos: CompanyInfo[] = await this.companyInfoRepo.find({ where: { status: 'active' }, fields: ['slug'] })

        const runner = companyInfos.map(async (companyInfo) => {
          // trigger to local rest api, don't know how to handle this since we have to solve the multi-tenant dan repo is using dynamic datasource

          const res = await fetch(`http://localhost:${Loopback4ServerConfig.port}/api/emission-scope3-employee-commuting/push-activities`, {
            method: 'post',
            headers: { 'x-tenant-id': companyInfo.slug },
            // body: { groupByIds: [], date: new Date() },
            // need to send jwt token, use root login
          })

          if (!res.ok) {
            throw Error(`Failed cron at ${companyInfo.slug}: ${new Date()}`)
          }
        })

        try {
          await Promise.allSettled(runner)
        } catch (e) {
          console.log('CronEmployeeCommutingActivities: ', e)
        }
      },
    })
  }
}
