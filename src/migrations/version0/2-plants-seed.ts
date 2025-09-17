import { LoopbackJwtCasbinBasic } from '../../application'
import {
  EnduserRepository,
  PlantCategoryRepository,
  PlantGrowthRateRepository,
  PlantRepository,
  PlantSpeciesRepository,
  PlantUrlRepository,
  StateRepository,
  PlantActualRepository,
  PlantActualDetailRepository,
  PlantTargetRepository,
} from '../../repositories'
import { faker } from '@faker-js/faker'
import { s, arraySize, getRandomItem } from './seed-helper'

export async function seedPlants(app: LoopbackJwtCasbinBasic) {
  /* ----------------------- END USER ------------------ */
  const endUserRepository = await app.getRepository(EnduserRepository)
  await endUserRepository.createAll(
    [
      {
        password: '$2a$10$ckpLdhWPzlNHMMcd9PIpj.Q3vllKijMtuo/0EbI09fiX5JYm2uWJy',
        cardid: 'cid-001',
        staffid: 'S-01',
        name: 'Enduser:System Administrator',
        email: 'enduser.system@admin.com',
      },
      {
        password: '$2a$10$5hKNjqccFbiW8DOOr119QuAvq3Y171fqW6Qo77uQa9LCPNOtFT6z6',
        cardid: 'cid-002',
        staffid: 'A-01',
        name: 'Enduser:Site Administrator',
        email: 'enduser.admin@gep.com',
      },
      {
        password: '$2a$10$asQw9Kro7eVAl3em4cex9.P5eOghWy68IpPynqt9aADhZjKKFgvYe',
        cardid: 'cid-003',
        staffid: 'O-01',
        name: 'Enduser:Site Dashboard',
        email: 'enduser.security@gep.com',
      },
      {
        password: '$2a$10$CveGXweoKJodbBtccadWlucuNRtwSF0bTAS.Eug7F7hmvYKpDNHga',
        cardid: 'cid-004',
        staffid: 'O-02',
        name: 'Enduser:Unit Keselamatan',
        email: 'enduser.officer@gep.com',
      },
      {
        password: '$2a$10$uNQfofUjOzwoB59XqXFCxOuiEPFSst8qwcPgWjRpk.DVvHd/2R2Se',
        cardid: 'string',
        staffid: 'string',
        name: 'Enduser:string',
        email: 'enduser.string',
      },
    ].map((i) => ({
      ...i,
      ...{
        isdeleted: '0',
        isgroup: '0',
        createdat: '2022-11-23 05:29:13',
        updatedat: '2022-11-23 05:29:13',
        realm: '',
        emailverified: 0,
        verificationtoken: '',
        phonenumber: faker.phone.number(),
      },
    }))
  )
  const endUserIds = await endUserRepository.find({ fields: ['id'] })
  console.log('Done: Enduser')

  /* ----------------------- STATE ------------------ */
  const stateRepository = await app.getRepository(StateRepository)
  await stateRepository.createAll([
    { state_name: 'Melaka', location_site: 'Ayer Keroh', longitude: 102.2834, latitude: 2.2666656 },
    { state_name: 'Selangor', location_site: 'Klang', longitude: 101.693207, latitude: 3.140853 },
    { state_name: 'Kuala Lumpur', location_site: 'Gombak', longitude: 143.932, latitude: 103 },
    { state_name: 'Melaka', location_site: 'Merlimau', longitude: 102.4266, latitude: 2.1812 },
    { state_name: 'Johor', location_site: 'Skudai', longitude: 103.6594, latitude: 1.5344 },
    { state_name: 'Sabah', location_site: 'Tawau', longitude: 4.2447, latitude: 117.8912 },
  ])
  const stateIds = await stateRepository.find({ fields: ['id'] })
  console.log('Done: State')

  /* ----------------------- PLANT CATEGORIES ------------------ */
  const plantCategoryRepository = await app.getRepository(PlantCategoryRepository)
  await plantCategoryRepository.createAll([{ name: 'Default', ...s() }, ...arraySize(() => ({ name: faker.person.firstName(), ...s() }))])
  const plantCategoriesIds = await plantCategoryRepository.find({ fields: ['id'] })
  console.log('Done: Plant category')

  /* ----------------------- PLANT ------------------ */
  const plantRepository = await app.getRepository(PlantRepository)
  const defaultPlantCategories = await plantCategoryRepository.find({ fields: ['id'], where: { name: 'Default' } })
  const _same1 = { plantCategoryId: defaultPlantCategories[0].id, ...s() }

  await plantRepository.createAll([
    { name: 'Bamboo', icon_path: '/icon_Bamboo.png', is_active: true, ..._same1 },
    { name: 'Mangrove', icon_path: '/icon_Mangrove.png', is_active: faker.datatype.boolean(), ..._same1 },
    { name: 'Paya Bakau', icon_path: '', is_active: faker.datatype.boolean(), ..._same1 },
    { name: 'Park Trees', icon_path: '', is_active: faker.datatype.boolean(), ..._same1 },
    { name: 'Roadside Trees', icon_path: '', is_active: faker.datatype.boolean(), ..._same1 },
    ...arraySize(() => ({
      name: faker.person.firstName(),
      icon_path: '',
      is_active: faker.datatype.boolean(),
      plantCategoryId: getRandomItem(plantCategoriesIds).id,
      ...s(),
    })),
  ])

  const bambooId = await plantRepository.find({ fields: ['id'], where: { name: 'Bamboo' } })
  const mangrove = await plantRepository.find({ fields: ['id'], where: { name: 'Mangrove' } })
  const payaBakau = await plantRepository.find({ fields: ['id'], where: { name: 'Paya Bakau' } })
  const parkTrees = await plantRepository.find({ fields: ['id'], where: { name: 'Park Trees' } })
  const roadSideTrees = await plantRepository.find({ fields: ['id'], where: { name: 'Roadside Trees' } })
  const plantIds = await plantRepository.find({ fields: ['id'] })
  console.log('Done: Plant')

  /* ----------------------- PLANT SPECIES ------------------ */
  const plantSpeciesRepository = await app.getRepository(PlantSpeciesRepository)
  await plantSpeciesRepository.createAll([
    { species_name: 'bakau', local_name: 'kayu', plantId: bambooId[0].id },
    { species_name: 'Quercus Palustris', local_name: 'Tree', plantId: payaBakau[0].id },
    { species_name: 'Nipa Palm', local_name: 'Pokok Nipah', plantId: bambooId[0].id },
    { species_name: 'Rhizophora', local_name: 'Bakau Minyak', plantId: bambooId[0].id },
    { species_name: 'Buluh', local_name: 'Tanjung', plantId: mangrove[0].id },
    { species_name: 'Bambusa vulgaris', local_name: 'B. Vulgaris', plantId: mangrove[0].id },
    { species_name: 'Phyllostachys heteroclada', local_name: 'Water Bamboo', plantId: payaBakau[0].id },
    { species_name: 'Bambusa Tulda', local_name: 'Bengal Bamboo', plantId: mangrove[0].id },
    { species_name: 'Khaya senegalensis', local_name: 'Khaya', plantId: parkTrees[0].id },
    { species_name: 'Alsponia angustifolia', local_name: 'Pulai', plantId: parkTrees[0].id },
    { species_name: 'Samanea saman', local_name: 'Hujan-hujan', plantId: parkTrees[0].id },
    { species_name: 'Mimusop elengi', local_name: 'Bunga Tanjung', plantId: parkTrees[0].id },
    { species_name: 'Syzygium elengi', local_name: 'Jambu Laut', plantId: parkTrees[0].id },
    { species_name: 'Hevea brasiliensis', local_name: 'Getah', plantId: parkTrees[0].id },
    { species_name: 'Peltophorum pterocarpum', local_name: 'Jemerlang', plantId: parkTrees[0].id },
    { species_name: 'Millettia pinnata', local_name: 'Mempari', plantId: parkTrees[0].id },
    { species_name: 'Hopea odorata', local_name: 'Merawan Siput Jantan', plantId: parkTrees[0].id },
    { species_name: 'Syzygium polyanthum', local_name: 'Salam ', plantId: parkTrees[0].id },
    { species_name: 'Dyera costulata', local_name: 'Jelutong', plantId: parkTrees[0].id },
    { species_name: 'Shoerea leprosula', local_name: 'Meranti Tembaga', plantId: parkTrees[0].id },
    { species_name: 'Melaleuca cajuputi', local_name: 'Gelam', plantId: roadSideTrees[0].id },
    { species_name: 'Pterocarpus indicus', local_name: 'Angsana', plantId: roadSideTrees[0].id },
    { species_name: 'Syzgium grande', local_name: 'Jambu Laut', plantId: roadSideTrees[0].id },
    { species_name: 'Samanea saman', local_name: 'Hujan-hujan', plantId: roadSideTrees[0].id },
    { species_name: 'Swietenia macrophylla', local_name: 'Mahogany', plantId: roadSideTrees[0].id },
    { species_name: 'Khaya grandifolia', local_name: 'African Mahogany', plantId: roadSideTrees[0].id },
    { species_name: 'Tabebuia rosea', local_name: 'Tecoma', plantId: roadSideTrees[0].id },
    { species_name: 'Cassia fistula', local_name: 'Rajah Kayu', plantId: roadSideTrees[0].id },
    { species_name: 'Hopea odorata', local_name: 'Merawan Siput Jantan', plantId: roadSideTrees[0].id },
    { species_name: 'Alstonia angustiloba', local_name: 'Pulai', plantId: roadSideTrees[0].id },
    { species_name: 'Cinnamomum verum', local_name: 'Kayu Manis', plantId: roadSideTrees[0].id },
    { species_name: 'Alstonia augustifolia', local_name: 'Pulai Penipu Raya', plantId: roadSideTrees[0].id },
  ])
  const plantSpeciesIds = await plantSpeciesRepository.find({ fields: ['id'] })
  console.log('Done: Plant species')

  /* ----------------------- PLANT URL ------------------ */
  const plantUrlRepository = await app.getRepository(PlantUrlRepository)
  await plantUrlRepository.createAll(
    arraySize(
      () => ({
        url: faker.internet.url(),
        plantId: getRandomItem(plantIds).id,
        ...s(),
      }),
      { min: 10, max: 40 }
    )
  )
  console.log('Done: Plant url')

  /* ----------------------- PLANT TARGET ------------------ */
  const plantTargetRepository = await app.getRepository(PlantTargetRepository)
  await plantTargetRepository.createAll(
    arraySize(
      () => ({
        year: faker.date.between({ from: '2015-01-01T00:00:00.000Z', to: '2024-01-01T00:00:00.000Z' }).getFullYear(),
        target: faker.number.int({ min: 0, max: 4000 }),
        plantId: getRandomItem(plantIds).id,
        ...s(),
      }),
      { min: 60, max: 200 }
    )
  )
  console.log('Done: Plant target')

  /* ----------------------- PLANT GROWTH RATE ------------------ */
  const plantGrowthRateRepository = await app.getRepository(PlantGrowthRateRepository)
  await plantGrowthRateRepository.createAll(
    plantIds.map((plant) => {
      return {
        details: arraySize(
          (index) => ({
            dbh: index > 5 ? faker.number.float({ fractionDigits: 1, max: 5 }) : 0,
            height: index <= 5 ? faker.number.int(100) : 0,
          }),
          { min: 20, max: 50 }
        ).reduce(
          (acc, cur, index) => {
            acc.push({
              dbh: (acc[index - 1]?.dbh ?? 0) + cur.dbh,
              height: (acc[index - 1]?.height ?? 0) + cur.height,
            })

            return acc
          },
          [] as { dbh: number; height: number }[]
        ),
        avg_co2_absorption: faker.number.float({ fractionDigits: 5, max: 1 }),
        carbon_fraction: faker.number.float({ fractionDigits: 5, max: 1 }),
        ratio: 0,
        approach: 'yearly-growth-rate',
        plantId: plant.id,
        ...s(),
      }
    })
  )
  console.log('Done: Plant growth rate')

  /* ----------------------- PLANT ACTUAL ------------------ */
  const plantActualRepository = await app.getRepository(PlantActualRepository)
  await plantActualRepository.createAll(
    arraySize(
      () => {
        const { createdAt, updatedAt } = s()
        return {
          status: getRandomItem(['completed', 'ongoing']),
          date_planted: faker.date.between({ from: createdAt, to: updatedAt }),
          plantId: getRandomItem(plantIds).id,
          stateId: getRandomItem(stateIds).id,
          enduserId: getRandomItem(endUserIds).id,
          createdAt,
          updatedAt,
        }
      },
      { min: 20, max: 50 }
    )
  )
  const plantActualIds = await plantActualRepository.find({ fields: ['id'] })
  console.log('Done: Plant actual')

  /* ----------------------- PLANT ACTUAL DETAILS  ------------------ */
  const plantActualDetailRepository = await app.getRepository(PlantActualDetailRepository)
  await plantActualDetailRepository.createAll(
    arraySize(
      () => ({
        no_of_seedling: faker.number.int({ min: 0, max: 1000 }),
        height: faker.number.int({ min: 0, max: 1000 }),
        geo_coverage: faker.number.int({ min: 0, max: 10 }),
        latitude: getRandomItem([6.43, 4.837475, 5.05, 5.65, 5.42, 1.53, 4.1, 2.21, 5.42, 4.185, 4.18, 1.53, 1.53232132, 5.65, 6.43, 5.65, 2.21, 3, 3, 2.4, 3,]), // prettier-ignore
        longitude: getRandomItem([100.19, 101.72749, 118.34, 100.48, 100.4, 103.75, 102.05, 102.25, 100.4, 102.05, 102.04, 103.75, 103.75, 100.48, 100.19, 100.48, 102.25, 103, 104, 45.1, 102]), // prettier-ignore
        plantActualId: getRandomItem(plantActualIds).id,
        plantSpeciesId: getRandomItem(plantSpeciesIds).id,
        ...s(),
      }),
      { min: 100, max: 200 }
    )
  )
  console.log('Done: Plant actual details')
}
