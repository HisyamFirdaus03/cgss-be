import { faker } from '@faker-js/faker'
import { MainDatasource } from '../../datasources'
import { CompanyInfoRepository, EmissionFactorRepository } from '../../repositories'
import { CompanyInfo, EmissionFactor } from '../../models'
import { _2023 } from './seed-emission-factor'

export const ClientList = [
  {
    name: 'demo',
    slug: 'demo',
    features: ['plant', 'emission'],
    theme: 'blue',
    expiredAt: undefined,
    addresses: [
      '123 Jalan Melati, Taman Perindustrian, Shah Alam, Selangor, 40000, Malaysia',
      '456 Jalan Pahlawan, Kampung Baru, Kuala Lumpur, Wilayah Persekutuan, 50480, Malaysia',
      '789 Jalan Sempurna, Taman Sri Gombak, Gombak, Selangor, 68100, Malaysia',
      '321 Jalan Bunga, Taman Bunga Raya, Ipoh, Perak, 31400, Malaysia',
      '654 Jalan Merdeka, Taman Merdeka, Melaka, Melaka, 75000, Malaysia',
    ],
    contactInfo: { name: 'Dr Afiq', email: 'afiqzubirchess@gmail.com', contactNo: '+60 12-245 1581' },
    metadata: {},
    status: 'active',
  },
  {
    name: 'mycronsteel',
    slug: 'mycronsteel',
    features: ['plant', 'emission'],
    theme: 'blue',
    expiredAt: undefined,
    addresses: [
      '112 Jalan Cempaka, Taman Cempaka, Johor Bahru, Johor, 81100, Malaysia',
      'Lot 717, Jalan Sungai Rasau, Seksyen 16, 40706 Shah Alam, Selangor, Malaysia',
      'Lot 53, Persiaran Selangor, Seksyen 15, 40200 Shah Alam, Selangor, Malaysia',
      'Lot 49, Jalan Utas 15/7, Seksyen 15, 40200 Shah Alam, Selangor, Malaysia',
      'Lot 10, Persiaran Selangor, Seksyen 15, 40200 Shah Alam, Selangor, Malaysia',
    ],
    contactInfo: { name: faker.person.firstName(), email: faker.internet.email(), contactNo: faker.phone.number() },
    metadata: {},
    status: 'active',
  },
  {
    name: 'MIG',
    slug: 'mig',
    features: ['emission'],
    theme: 'blue',
    expiredAt: undefined,
    addresses: ['MIGB Head Office - 15th Floor, No. 566, Jalan Ipoh, 51200 WP KL.', '3BO Rawang Factory - No. 23, Jalan Cempaka Utama, Taman Anugerah Suria, 48200 Serendah, Selangor.', '3BT Processing Centre - No. 1, Jalan BCU 3, Kawasan Perindustrian Batu Caves Utara, 68100 Batu Caves, Selangor.', 'MSM Shah Alam - Lot 717, Jalan Sg. Rasau, Seksyen 16, 40200 Shah Alam, Selangor', '3Bumi (Cambodia) Co. Ltd - Alamin Minimart Outlets, National Road 5, House#B1, Sangkat Chrang Chamres I, Khan Russey Keo, Phnom Penh City, Cambodia'],
    contactInfo: { name: faker.person.firstName(), email: faker.internet.email(), contactNo: faker.phone.number() },
    metadata: {},
    status: 'active',
  },
  {
    name: 'DemoFresh',
    slug: 'demo-fresh',
    features: ['emission', 'plant'],
    theme: 'green',
    expiredAt: undefined,
    addresses: ['MIGB Head Office - 15th Floor, No. 566, Jalan Ipoh, 51200 WP KL.', '3BO Rawang Factory - No. 23, Jalan Cempaka Utama, Taman Anugerah Suria, 48200 Serendah, Selangor.', '3BT Processing Centre - No. 1, Jalan BCU 3, Kawasan Perindustrian Batu Caves Utara, 68100 Batu Caves, Selangor.', 'MSM Shah Alam - Lot 717, Jalan Sg. Rasau, Seksyen 16, 40200 Shah Alam, Selangor', '3Bumi (Cambodia) Co. Ltd - Alamin Minimart Outlets, National Road 5, House#B1, Sangkat Chrang Chamres I, Khan Russey Keo, Phnom Penh City, Cambodia'],
    contactInfo: { name: faker.person.firstName(), email: faker.internet.email(), contactNo: faker.phone.number() },
    metadata: {},
    status: 'active',
  },
] as CompanyInfo[]

export const CompanyInfoRepo = new CompanyInfoRepository(new MainDatasource())

export async function restoreCompanyInfo(prevValues: CompanyInfo[]) {
  const clients = prevValues.length ? prevValues : ClientList

  await CompanyInfoRepo.deleteAll()
  await CompanyInfoRepo.createAll(clients)
  console.log('Done: CompanyInfo')
}

export const EmissionFactorRepo = new EmissionFactorRepository(new MainDatasource())

export async function restoreEmissionFactorRepo(prevValues: EmissionFactor[]) {
  const ef = prevValues.length ? prevValues : [{ year: 2023, ..._2023['2023'] }]

  await EmissionFactorRepo.deleteAll()
  await EmissionFactorRepo.createAll(ef)
  console.log('Done: EmissionFactor')
}
