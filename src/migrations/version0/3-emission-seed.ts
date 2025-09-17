import { LoopbackJwtCasbinBasic } from '../../application'
import {
  EmissionProductionActivityRepository,
  EmissionProductionRepository,
  EmissionScope1FugitiveEmissionActivityRepository,
  EmissionScope1FugitiveEmissionRepository,
  EmissionScope1MobileCombustionActivityRepository,
  EmissionScope1MobileCombustionRepository,
  EmissionScope1ProcessEmissionActivityRepository,
  EmissionScope1ProcessEmissionRepository,
  EmissionScope1StationaryCombustionActivityRepository,
  EmissionScope1StationaryCombustionRepository,
  EmissionScope2ActivityRepository,
  EmissionScope2Repository,
  EmissionScope3BusinessTravelActivityRepository,
  EmissionScope3BusinessTravelRepository,
  EmissionScope3EmployeeCommutingActivityRepository,
  EmissionScope3EmployeeCommutingRepository,
  EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository,
  EmissionScope3WasteGeneratedActivityRepository,
  EmissionScope3WasteGeneratedRepository,
  EmployeeRegistryRepository,
  GroupByRepository,
  MobileRegistryRepository,
  UserRepository,
} from '../../repositories'
import { arraySize, getRandomItem, timeStampSeed } from './seed-helper'
import {
  EmissionFactor,
  type EmissionScope1MobileCombustionWithRelations,
  EmissionScope3EmployeeCommutingWithRelations,
  GroupBy,
} from '../../models'
import { UserGroupByMapRepository } from '../../repositories'
import { faker } from '@faker-js/faker'
import { getDaysInMonth } from 'date-fns'
import { turnOfUserModifiableFields } from '../../common'
import { range } from 'lodash'

const randomMinMax = { min: 30, max: 100 }
const scope = {
  _1: {
    sc: { main: randomMinMax, activities: { min: 1, max: 2 } },
    mc: { main: randomMinMax, activities: { min: 1, max: 5 } },
    fe: { main: randomMinMax, activities: { min: 5, max: 10 } },
    pe: { main: randomMinMax, activities: { min: 5, max: 10 } },
  },
  _2: { main: randomMinMax, activities: { min: 5, max: 10 } },
  _3: {
    ec: { main: randomMinMax, activities: { min: 5, max: 10 } },
    bt: { main: { min: 100, max: 300 }, activities: { min: 1, max: 10 } },
    udtd: { min: 500, max: 1000 },
    wg: { main: { min: 100, max: 300 }, activities: { min: 1, max: 10 } },
  },
  ep: { main: randomMinMax, activities: { min: 5, max: 10 } },
}

const randomStatus = (): 'active' | 'inactive' => faker.helpers.weightedArrayElement([{
  weight: 8,
  value: 'active',
}, { weight: 2, value: 'inactive' }]) // prettier-ignore
type Ids = { id: number }[]

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec']
const generateActivitiesData = <T>(jsonFactory: () => T, howMuch = { min: 10, max: 20 }): T[] => {
  const years = arraySize(() => new Date().getFullYear(), { min: 5, max: 10 })
    .map((y, i) => y - i)
    .sort() // generate years 2024-2014

  const all = years.flatMap((year) => {
    return months.flatMap((month, monthIndex) => {
      const maxDays = getDaysInMonth(new Date(year, monthIndex + 1))

      return arraySize(() => undefined, { min: maxDays, max: maxDays }).flatMap((_, day) => {
        return arraySize(() => {
          const isEmptyOrNot = faker.helpers.weightedArrayElement([{ weight: 9, value: true }, {
            weight: 1,
            value: false,
          }]) // prettier-ignore
          return isEmptyOrNot
            ? {
              date: new Date(year, monthIndex, day), // `${year}-${monthIndex + 1}-${day + 1}`,
              input: faker.number.float({ fractionDigits: 2, min: 0, max: 300 }),
              desc: faker.commerce.productDescription(),
              ...jsonFactory(),
            }
            : null
        }, howMuch).filter(Boolean) as T[]
      })
    })
  })

  return all
}

export async function seedEmission(lb4App: LoopbackJwtCasbinBasic, emissionFactors: EmissionFactor) {
  const userRepository = await lb4App.getRepository(UserRepository)
  const groupByRepository = await lb4App.getRepository(GroupByRepository)

  const userIds = (await userRepository.find({ fields: ['id'] })) as Ids
  const groupByData = arraySize(
    () => ({ name: faker.lorem.word(), status: randomStatus(), ...timeStampSeed(userIds) }), { min: 5, max: 10 },
  ) as GroupBy[] // prettier-ignore

  await groupByRepository.createAll(groupByData)
  const groupByIds = (await groupByRepository.find({ fields: ['id'] })) as Ids
  await groupByRepository.create({ name: 'Group with empty connection', status: 'active' })
  console.log('Done: GroupBy')

  try {
    const userGroupByRepo = await lb4App.getRepository(UserGroupByMapRepository)
    const allUsers = (await userRepository.find({ fields: ['id'] })) as Ids

    for (const u of allUsers) {
      const howMany = Math.max(1, Math.min(3, Math.floor(Math.random() * 3) + 1))
      const selected = new Set<number>()
      while (selected.size < howMany) {
        const gid = getRandomItem(groupByIds).id
        selected.add(gid)
      }
      for (const gid of selected) {
        await userGroupByRepo.create({ userId: u.id, groupById: gid })
      }
    }
    console.log('Done: UserGroupByMap')
  } catch (e) {
    console.warn('Skipping UserGroupByMap seed:', e?.message ?? e)
  }

  await SEED.SCOPE1.STATIONARY_COMBUSTION(lb4App, { emissionFactors, groupByIds, userIds })
  await SEED.SCOPE1.MOBILE_COMBUSTION(lb4App, { emissionFactors, groupByIds, userIds })
  await SEED.SCOPE1.PROCESS_EMISSION(lb4App, { groupByIds, userIds })
  await SEED.SCOPE1.FUGITIVE_EMISSION(lb4App, { groupByIds, userIds })
  await SEED.SCOPE2(lb4App, { groupByIds, userIds })
  await SEED.SCOPE3.EMPLOYEE_COMMUTING(lb4App, { emissionFactors, groupByIds, userIds })
  await SEED.SCOPE3.BUSINESS_TRAVEL(lb4App, { emissionFactors, groupByIds, userIds })
  await SEED.SCOPE3.UPSTREAM_DOWNSTREAM_TRANSPORTATION_AND_DISTRIBUTION(lb4App, {
    emissionFactors,
    groupByIds,
    userIds,
  })
  await SEED.SCOPE3.WASTE_GENERATED(lb4App, { emissionFactors, groupByIds, userIds })
  await SEED.EMISSION_PRODUCTION(lb4App, { groupByIds, userIds })
}

const SEED = {
  SCOPE1: {
    STATIONARY_COMBUSTION: async (
      lb4App: LoopbackJwtCasbinBasic,
      { emissionFactors, groupByIds, userIds }: { emissionFactors: EmissionFactor; groupByIds: Ids; userIds: Ids },
    ) => {
      const emissionScope1StationaryCombustionRepository = await lb4App.getRepository(EmissionScope1StationaryCombustionRepository)
      const emissionScope1StationaryCombustionActivityRepository = await lb4App.getRepository(EmissionScope1StationaryCombustionActivityRepository) // prettier-ignore

      await emissionScope1StationaryCombustionRepository.createAll(
        arraySize(
          () => ({
            typeId: getRandomItem(emissionFactors?.stationary_combustion).id,
            groupById: getRandomItem(groupByIds).id,
            status: randomStatus(),
            ...timeStampSeed(userIds),
          }),
          scope._1.sc.main,
        ),
      )
      console.log('Done: Stationary Combustion')

      const emissionScope1StationaryCombustion = await emissionScope1StationaryCombustionRepository.find({ fields: ['id'] })
      await emissionScope1StationaryCombustionActivityRepository.createAll(
        generateActivitiesData(
          () => ({
            stationaryCombustionId: getRandomItem(emissionScope1StationaryCombustion).id,
            ...timeStampSeed(userIds),
          }),
          scope._1.sc.activities,
        ),
      )
      console.log('Done: Stationary Combustion Activities')
    },
    MOBILE_COMBUSTION: async (
      lb4App: LoopbackJwtCasbinBasic,
      { emissionFactors, groupByIds, userIds }: { emissionFactors: EmissionFactor; groupByIds: Ids; userIds: Ids },
    ) => {
      const mobileRegistryRepository = await lb4App.getRepository(MobileRegistryRepository)
      await mobileRegistryRepository.createAll(
        arraySize(() => {
          const rand = getRandomItem(emissionFactors?.mobile_combustion.distance)

          return {
            identity_no: faker.vehicle.vrm(),
            model: faker.vehicle.model(),
            EF_MobileCombustionDistanceId: rand.id,
            status: randomStatus(),
            ...timeStampSeed(userIds),
          }
        }, scope._1.mc.main),
      )
      console.log('Done: Mobile Registry')
      const mobileRegistryIds = await mobileRegistryRepository.find({ fields: ['id'] })

      const emissionScope1MobileCombustionRepository = await lb4App.getRepository(EmissionScope1MobileCombustionRepository)

      await emissionScope1MobileCombustionRepository.createAll(
        arraySize(
          () => ({
            groupById: getRandomItem(groupByIds).id,
            mobileRegistryId: getRandomItem(mobileRegistryIds).id,
            status: randomStatus(),
            ...timeStampSeed(userIds),
          }),
          scope._1.mc.main,
        ),
      )
      console.log('Done: Mobile Combustion')

      const emissionScope1MobileCombustionIds = await emissionScope1MobileCombustionRepository.find({
        fields: ['id', 'mobileRegistryId'],
        include: [{ relation: 'mobileRegistry', scope: { fields: ['EF_MobileCombustionDistanceId'] } }],
      })
      const emissionScope1MobileCombustionActivityRepository = await lb4App.getRepository(EmissionScope1MobileCombustionActivityRepository)

      await emissionScope1MobileCombustionActivityRepository.createAll(
        generateActivitiesData(() => {
          const item = getRandomItem(emissionScope1MobileCombustionIds)

          // this can be undefined because some vehicle doesn't have emission in litre form. then we force it to be distance
          const foundDistance = emissionFactors?.mobile_combustion.distance.find((i) => i.id === (item as EmissionScope1MobileCombustionWithRelations).mobileRegistry.EF_MobileCombustionDistanceId) // prettier-ignore
          const isLitreExist = emissionFactors?.mobile_combustion.litre.find((i) => i.id === foundDistance?.litreId)

          return {
            mobileCombustionId: item.id,
            type: (isLitreExist
              ? faker.helpers.weightedArrayElement([{ weight: 3, value: 'litre' }, { weight: 5, value: 'distance' }]) // prettier-ignore
              : 'distance') as 'litre' | 'distance',
            ...timeStampSeed(userIds),
          }
        }, scope._1.mc.activities),
      )
      console.log('Done: Mobile Combustion Activities')
    },
    PROCESS_EMISSION: async (lb4App: LoopbackJwtCasbinBasic, { groupByIds, userIds }: {
      groupByIds: Ids;
      userIds: Ids
    }) => {
      const emissionScope1ProcessEmissionRepository = await lb4App.getRepository(EmissionScope1ProcessEmissionRepository)
      const emissionScope1ProcessEmissionActivityRepository = await lb4App.getRepository(EmissionScope1ProcessEmissionActivityRepository)

      await emissionScope1ProcessEmissionRepository.createAll(
        arraySize(
          () => ({
            category: faker.lorem.word({ length: { min: 1, max: 10 } }),
            groupById: getRandomItem(groupByIds).id,
            status: randomStatus(),
            ...timeStampSeed(userIds),
          }),
          scope._1.pe.main,
        ),
      )
      console.log('Done: Process Emission')

      const emissionScope1ProcessEmission = await emissionScope1ProcessEmissionRepository.find({ fields: ['id'] })
      await emissionScope1ProcessEmissionActivityRepository.createAll(
        generateActivitiesData(
          () => ({
            processEmissionId: getRandomItem(emissionScope1ProcessEmission).id,
            ...timeStampSeed(userIds),
          }),
          scope._1.pe.activities,
        ),
      )
      console.log('Done: Process Emission Activities')
    },
    FUGITIVE_EMISSION: async (lb4App: LoopbackJwtCasbinBasic, { groupByIds, userIds }: {
      groupByIds: Ids;
      userIds: Ids
    }) => {
      const emissionScope1FugitiveEmissionRepository = await lb4App.getRepository(EmissionScope1FugitiveEmissionRepository)
      const emissionScope1FugitiveEmissionActivityRepository = await lb4App.getRepository(EmissionScope1FugitiveEmissionActivityRepository)

      await emissionScope1FugitiveEmissionRepository.createAll(
        arraySize(
          () => ({
            category: faker.lorem.word({ length: { min: 1, max: 10 } }),
            groupById: getRandomItem(groupByIds).id,
            status: randomStatus(),
            ...timeStampSeed(userIds),
          }),
          scope._1.fe.main,
        ),
      )
      console.log('Done: Fugitive Emission')

      const emissionScope1FugitiveEmission = await emissionScope1FugitiveEmissionRepository.find({ fields: ['id'] })
      await emissionScope1FugitiveEmissionActivityRepository.createAll(
        generateActivitiesData(
          () => ({
            fugitiveEmissionId: getRandomItem(emissionScope1FugitiveEmission).id,
            ...timeStampSeed(userIds),
          }),
          scope._1.fe.activities,
        ),
      )
      console.log('Done: Fugitive Emission Activities')
    },
  },
  SCOPE2: async (lb4App: LoopbackJwtCasbinBasic, { groupByIds, userIds }: { groupByIds: Ids; userIds: Ids }) => {
    const emissionScope2Repository = await lb4App.getRepository(EmissionScope2Repository)
    const emissionScope2ActivityRepository = await lb4App.getRepository(EmissionScope2ActivityRepository)

    await emissionScope2Repository.createAll(
      arraySize(() => {
        const type = faker.helpers.weightedArrayElement([
          { weight: 8, value: 'electric' },
          { weight: 0.5, value: 'steam' },
          { weight: 0.5, value: 'heat' },
          { weight: 0.5, value: 'cooling' },
        ]) as 'electric' | 'steam' | 'heat' | 'cooling'

        return {
          type,
          ...(type === 'electric' ? { location: getRandomItem(['peninsular', 'sabah', 'sarawak']) } : {}),
          groupById: getRandomItem(groupByIds).id,
          category: faker.helpers.weightedArrayElement([
            { weight: 5, value: faker.string.alpha({ length: { min: 10, max: 30 } }) },
            { weight: 3, value: '' },
          ]),
          status: randomStatus(),
          ...timeStampSeed(userIds),
        }
      }, scope._2.main),
    )
    console.log('Done: Scope2')

    const emissionScope2Ids = await emissionScope2Repository.find({ fields: ['id'] })
    await emissionScope2ActivityRepository.createAll(
      generateActivitiesData(
        () => ({
          scope2Id: getRandomItem(emissionScope2Ids).id,
          ...timeStampSeed(userIds),
        }),
        scope._2.activities,
      ),
    )
    console.log('Done: Scope2 Activities')
  },
  SCOPE3: {
    EMPLOYEE_COMMUTING: async (
      lb4App: LoopbackJwtCasbinBasic,
      { emissionFactors, groupByIds, userIds }: { emissionFactors: EmissionFactor; groupByIds: Ids; userIds: Ids },
    ) => {
      const employeeRegistryRepository = await lb4App.getRepository(EmployeeRegistryRepository)
      const emissionScope3EmployeeCommutingRepository = await lb4App.getRepository(EmissionScope3EmployeeCommutingRepository)
      const emissionScope3EmployeeCommutingActivityRepository = await lb4App.getRepository(EmissionScope3EmployeeCommutingActivityRepository) // prettier-ignore

      await employeeRegistryRepository.createAll(
        arraySize(() => {
          const rand = getRandomItem(emissionFactors?.mobile_combustion.distance)

          return {
            name: faker.person.firstName(),
            staffId: faker.lorem.word(3).toUpperCase() + (faker.number.int({ max: 2000 }) + '').padStart(4, '0'),
            addressFrom: faker.location.streetAddress(),
            addressTo: faker.location.streetAddress(),
            distance: faker.number.float() * faker.number.int({ min: 5, max: 20 }), // km
            avg_day_working_per_month: faker.number.int({ min: 20, max: 30 }),
            EF_MobileCombustionDistanceId: rand.id,
            status: randomStatus(),
            ...timeStampSeed(userIds),
          }
        }, scope._3.ec.main),
      )
      console.log('Done: Employee Registry')
      const employeeRegistries = await employeeRegistryRepository.find()

      await emissionScope3EmployeeCommutingRepository.createAll(
        arraySize(
          () => ({
            groupById: getRandomItem(groupByIds).id,
            employeeRegistryId: getRandomItem(employeeRegistries).id,
            status: randomStatus(),
            ...timeStampSeed(userIds),
          }),
          scope._1.mc.main,
        ),
      )
      console.log('Done: Employee Commuting')

      const emissionScope3EmployeeCommutingData = (await emissionScope3EmployeeCommutingRepository.find({
        fields: ['id', 'employeeRegistryId'],
        include: [{ relation: 'employeeRegistry', scope: { fields: turnOfUserModifiableFields } }],
      })) as EmissionScope3EmployeeCommutingWithRelations[]

      const years = arraySize(() => new Date().getFullYear(), { min: 5, max: 10 })
        .map((y, i) => y - i)
        .sort() // generate years 2024-2014

      const all = (_ecData: EmissionScope3EmployeeCommutingWithRelations) =>
        years.flatMap((year) => {
          return months.flatMap((month, monthIndex) => {
            return {
              date: new Date(year, monthIndex, 2), // 2nd on every month
              input: _ecData.employeeRegistry.avg_day_working_per_month,
              desc: faker.commerce.productDescription(),
              employeeCommutingId: _ecData.id,
              metadata: {
                addressFrom: _ecData.employeeRegistry.addressFrom,
                addressTo: _ecData.employeeRegistry.addressTo,

                distance: _ecData.employeeRegistry.distance,
                EF_MobileCombustionDistanceId: _ecData.employeeRegistry.EF_MobileCombustionDistanceId,
              },
            }
          })
        })

      for (const data of emissionScope3EmployeeCommutingData) {
        await emissionScope3EmployeeCommutingActivityRepository.createAll(all(data))
      }

      console.log('Done: Employee Commuting Activities')
    },
    BUSINESS_TRAVEL: async (
      lb4App: LoopbackJwtCasbinBasic,
      { emissionFactors, groupByIds, userIds }: { emissionFactors: EmissionFactor; groupByIds: Ids; userIds: Ids },
    ) => {
      // Business travel require employee registry seed first, being done in employee commuting seed
      const employeeRegistryRepository = await lb4App.getRepository(EmployeeRegistryRepository)
      const emissionScope3BusinessTravelRepository = await lb4App.getRepository(EmissionScope3BusinessTravelRepository)
      const emissionScope3BusinessTravelActivityRepository = await lb4App.getRepository(EmissionScope3BusinessTravelActivityRepository) // prettier-ignore

      async function seedBT() {
        const transaction = await emissionScope3BusinessTravelRepository.beginTransaction()

        const bt = await emissionScope3BusinessTravelRepository.create(
          {
            date: faker.date.betweens({
              from: '2013-12-31T16:00:00.000Z',
              to: '2024-12-31T15:59:59.999Z',
              count: 1,
            })[0],
            purpose: faker.lorem.sentence({ min: 3, max: 10 }),
            desc: faker.lorem.sentence({ min: 10, max: 15 }),
            groupById: getRandomItem(groupByIds).id,
            ...timeStampSeed(userIds),
          },
          { transaction },
        )

        const employeeRegistryIds = await employeeRegistryRepository.find({ fields: ['id'] })
        const abc = faker.helpers.arrayElements(employeeRegistryIds).map((employeeRegistry) => {
          return {
            businessTravelId: bt.id,
            employeeRegistryId: employeeRegistry.id,
            logs: arraySize(() => {
              const rand = getRandomItem(emissionFactors?.mobile_combustion.distance)

              const foundDistance = emissionFactors?.mobile_combustion.distance.find((i) => i.id === rand.id)
              const isLitreExist = emissionFactors?.mobile_combustion.litre.find((i) => i.id === foundDistance?.litreId)

              return {
                addressFrom: faker.location.streetAddress(),
                addressTo: faker.location.streetAddress(),
                type: (isLitreExist
                  ? faker.helpers.weightedArrayElement([{ weight: 2, value: 'litre' }, {
                    weight: 5,
                    value: 'distance',
                  }]) // prettier-ignore
                  : 'distance') as 'distance' | 'litre',
                input: faker.number.float({ fractionDigits: 2, min: 0, max: 300 }),
                EF_MobileCombustionDistanceId: rand.id,
              }
            }, scope._3.bt.activities),
            ...timeStampSeed(userIds),
          }
        })

        const bta = await emissionScope3BusinessTravelActivityRepository.createAll(abc, { transaction })
        await transaction.commit()
      }

      for (let _ of range(faker.number.int(scope._3.bt.main))) {
        await seedBT()
      }

      console.log('Done: Business Travel')
    },
    UPSTREAM_DOWNSTREAM_TRANSPORTATION_AND_DISTRIBUTION: async (
      lb4App: LoopbackJwtCasbinBasic,
      { emissionFactors, groupByIds, userIds }: { emissionFactors: EmissionFactor; groupByIds: Ids; userIds: Ids },
    ) => {
      const repo = await lb4App.getRepository(EmissionScope3UpstreamDownstreamTransportationAndDistributionRepository)

      await repo.createAll(
        range(faker.number.int(scope._3.udtd)).map((i) => {
          const rand = getRandomItem(emissionFactors?.mobile_combustion.distance)

          return {
            date: faker.date.betweens({
              from: '2013-12-31T16:00:00.000Z',
              to: '2024-12-31T15:59:59.999Z',
              count: 1,
            })[0],
            name: faker.lorem.sentence({ min: 3, max: 10 }),
            desc: faker.lorem.sentence({ min: 10, max: 15 }),
            groupById: getRandomItem(groupByIds).id,
            type: faker.helpers.arrayElement(['downstream', 'upstream'] as const),
            metadata: {
              addressFrom: faker.location.streetAddress(),
              addressTo: faker.location.streetAddress(),
              distance: faker.number.float({ fractionDigits: 2, min: 0, max: 300 }),
              EF_MobileCombustionDistanceId: rand.id,
            },
            ...timeStampSeed(userIds),
          }
        }),
      )

      console.log('Done: Upstream Downstream Transportation and Distribution')
    },

    WASTE_GENERATED: async (lb4App: LoopbackJwtCasbinBasic, { emissionFactors, groupByIds, userIds }: {
      emissionFactors: EmissionFactor, groupByIds: Ids; userIds: Ids
    }) => {
      const emissionScope3WasteGeneratedRepository = await lb4App.getRepository(EmissionScope3WasteGeneratedRepository)
      const emissionScope3WasteGeneratedActivityRepository = await lb4App.getRepository(EmissionScope3WasteGeneratedActivityRepository) // prettier-ignore

      await emissionScope3WasteGeneratedRepository.createAll(
        arraySize(
          () => {
            const type = getRandomItem(['waste_type_specific_method', 'supplier_specific_method'] as const)

            let temp = {}
            if (type === 'waste_type_specific_method') {
              const material = getRandomItem(emissionFactors.waste_generated)
              const method = ['recycled', 'landfilled', 'combusted', 'composted', 'anaerobically_digested_dry', 'anaerobically_digested_wet'] as const

              const methodsAvailable = (method).reduce((acc: (typeof method)[number][], c) => {
                if (typeof material[c] === 'number' && material[c] >= 0) acc.push(c)
                return acc
              }, []) as (typeof method)[number][]

              temp = {
                materialId: material.id,
                method: faker.helpers.arrayElement(methodsAvailable),
              }
            } else {
              temp = { materialId: getRandomItem(emissionFactors.waste_generated_supplier_specific_method).id }
            }

            return ({
              category: faker.lorem.word({ length: { min: 1, max: 10 } }),
              type,
              ...temp,
              groupById: getRandomItem(groupByIds).id,
              status: randomStatus(),
              ...timeStampSeed(userIds),
            })
          },
          scope._3.wg.main,
        ),
      )
      console.log('Done: Waste Generated')

      const wasteGenerated = await emissionScope3WasteGeneratedRepository.find({ fields: ['id'] })
      await emissionScope3WasteGeneratedActivityRepository.createAll(
        generateActivitiesData(
          () => ({
            wasteGeneratedId: getRandomItem(wasteGenerated).id,
            ...timeStampSeed(userIds),
          }),
          scope._3.wg.activities,
        ),
      )
      console.log('Done: Waste Generated Activities')
    },
  },
  EMISSION_PRODUCTION: async (lb4App: LoopbackJwtCasbinBasic, { groupByIds, userIds }: {
    groupByIds: Ids;
    userIds: Ids
  }) => {
    const emissionProductionRepository = await lb4App.getRepository(EmissionProductionRepository)
    const emissionProductionActivityRepository = await lb4App.getRepository(EmissionProductionActivityRepository)

    await emissionProductionRepository.createAll(
      arraySize(
        () => ({
          category: faker.lorem.word({ length: { min: 1, max: 10 } }),
          groupById: getRandomItem(groupByIds).id,
          status: randomStatus(),
          ...timeStampSeed(userIds),
        }),
        scope.ep.main,
      ),
    )
    console.log('Done: Emission Production')

    const emissionProductionIds = await emissionProductionRepository.find({ fields: ['id'] })
    await emissionProductionActivityRepository.createAll(
      generateActivitiesData(
        () => ({
          emissionProductionId: getRandomItem(emissionProductionIds).id,
          ...timeStampSeed(userIds),
        }),
        scope.ep.activities,
      ),
    )
    console.log('Done: Emission Production Activities')
  },
}
