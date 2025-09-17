import { spawn } from 'child_process'
import {
  restoreCompanyInfo,
  ClientList,
  CompanyInfoRepo,
  restoreEmissionFactorRepo,
  EmissionFactorRepo,
} from '../migrations/version0/0-main-datasource-seed'

const clientSlugs = ClientList.map((i) => i.slug)

;(async () => {
  // const answers = { action: 'update tables & seed', dbs: 'All' }
  const answers = { action: 'update tables & seed', dbs: 'demo' }
  const action = answers.action === 'update tables' ? 'alter' : 'drop'
  const dbs = (answers.dbs === 'All' ? clientSlugs : [answers.dbs]).map((db) => datasource(db, action))

  try {
    // we need to restore this back later after all db seeded
    const saveCurrentCompanyInfo = await CompanyInfoRepo.find({ fields: { id: false } })
    const saveCurrentEmissionInfo = await EmissionFactorRepo.find({ fields: { id: false } })

    for await (const db of dbs) {
      console.log('Done:', db)
    }

    await restoreCompanyInfo(saveCurrentCompanyInfo)
    await restoreEmissionFactorRepo(saveCurrentEmissionInfo)
  } catch (e) {
    console.log('Error', e)
  }

  process.exit(0)
})()

export async function datasource(_db: string, action: 'alter' | 'drop') {
  const db = `datasources.db.cgss_${_db}`

  return new Promise<string>((resolve, reject) => {
    const command = 'node'
    const args = ['./dist/migrations/migrate-runner.js']

    const child = spawn(command, args, {
      env: {
        ...process.env,
        DATABASE_LB4_PATH: db,
        DATABASE_LB4_MIGRATE_ACTION: action,
      },
    })

    const maxLen = Math.max(...clientSlugs.map((i) => i.length))
    child.stdout.on('data', (data) => console.log(`${_db.padEnd(maxLen)}: ${data}`))
    child.stderr.on('data', (data) => console.error(`stderr: ${data}`))

    child.on('close', (code) => {
      if (code === 0) {
        resolve(_db)
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
  })
}
