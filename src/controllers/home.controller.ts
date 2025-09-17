/* eslint-disable @typescript-eslint/ban-ts-comment */
import { repository } from '@loopback/repository'
import { PlantActualDetailRepository, PlantTargetRepository } from '../repositories'
import { JwtStrategy } from '../common'
import { authenticate } from '@loopback/authentication'
import { get, getModelSchemaRef, param, response } from '@loopback/rest'
import { PlantActualDetail, PlantActualDetailWithRelations, PlantTarget, PlantTargetWithRelations } from '../models'
import { startOfYear, endOfYear, getYear } from 'date-fns'
import { get as _get, range, sortBy } from 'lodash'

@authenticate(JwtStrategy.UserAccessToken)
export class HomeController {
  constructor(
    @repository(PlantActualDetailRepository)
    public plantActualDetailRepository: PlantActualDetailRepository,
    @repository(PlantTargetRepository)
    public plantTargetRepository: PlantTargetRepository
  ) {}

  @get('/home/{plant}/{year}/actual-vs-target')
  @response(200, {
    description: 'Array of 5 latest years of PlantTarget and PlantActualDetail model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: {
            actual: {
              type: 'array',
              items: getModelSchemaRef(PlantActualDetail, { includeRelations: true }),
            },
            target: {
              type: 'array',
              items: getModelSchemaRef(PlantTarget, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findActualVsTarget(
    @param.path.string('plant') plant = 'all',
    @param.path.number('year') year: number = new Date().getFullYear()
  ): Promise<never> {
    const yearStart = startOfYear(new Date(year - 5 + ''))
    const yearEnd = endOfYear(new Date(year + ''))
    const yearRanges = range(year - 4, year + 1, 1) // latest 5 years

    const actuals = await getLineActual.call(this, { yearEnd, yearRanges, yearStart, plant })
    const targets = await getLinTarget.call(this, { yearRanges, plant })

    // @ts-ignore
    return {
      years: yearRanges,
      actuals: Object.values(actuals),
      targets: Object.values(targets),
    }
  }

  @get('/home/{plant}/{year}/plant-breakdown')
  @response(200, {
    description: 'items of PlantTarget and PlantActualDetail breakdown model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: {
            actual: {
              type: 'array',
              items: getModelSchemaRef(PlantActualDetail, { includeRelations: true }),
            },
            target: {
              type: 'array',
              items: getModelSchemaRef(PlantTarget, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findPlantBreakdown(@param.path.string('plant') plant = 'all', @param.path.string('year') year = ''): Promise<never> {
    const queryActivePlants = {
      relation: 'plant',
      scope: {
        fields: { name: true, id: true },
        where: {
          ...(plant === 'all' ? {} : { name: { eq: plant } }),
          is_active: { eq: true },
        },
      },
    }

    const targetData = await this.plantTargetRepository.find({
      fields: { year: true, target: true, plantId: true },
      // @ts-ignore
      ...((year === 'all' ? {} : { where: { year: { eq: +year } } }) as unknown as never),
      include: [queryActivePlants],
    })

    const actualsData = await this.plantActualDetailRepository.find({
      fields: { no_of_seedling: true, plantActualId: true },
      include: [
        {
          relation: 'plantActual',
          scope: {
            fields: { plantId: true, status: true, date_planted: true },
            ...(year === 'all' ? {} : { where: { date_planted: { between: [startOfYear(new Date(year)), endOfYear(new Date(year))] } } }),
            include: [queryActivePlants],
          },
        },
      ],
    })

    const filteredTargets = sortBy(
      targetData
        .filter((i) => _get(i, 'plant'))
        .map((i) => ({
          year: i.year,
          target: i.target,
          name: _get(i, 'plant.name') as unknown as string,
        })),
      'year'
    )

    const targets = filteredTargets.reduce(
      (acc, c) => {
        if (acc[c.name]) {
          acc[c.name] += c.target
        } else {
          acc[c.name] = c.target
        }

        return acc
      },
      {} as Record<string, number>
    )

    const filteredActuals = sortBy(
      actualsData
        .filter((i) => _get(i, 'plantActual.plant.name', false))
        .map((i) => ({
          no_of_seedling: i.no_of_seedling,
          date_planted: getYear(_get(i, 'plantActual.date_planted')!),
          name: _get(i, 'plantActual.plant.name') as unknown as string,
        })),
      'date_planted'
    )

    const actuals = filteredActuals.reduce(
      (acc, c) => {
        if (acc[c.name]) {
          acc[c.name] += c.no_of_seedling
        } else {
          acc[c.name] = c.no_of_seedling
        }

        return acc
      },
      {} as Record<string, number>
    )

    // @ts-ignore
    return {
      year,
      target: { labels: Object.keys(targets), datasets: Object.values(targets) },
      actual: { labels: Object.keys(actuals), datasets: Object.values(actuals) },
    }
  }

  @get('/home/annual-co2-emission')
  @response(200, {
    description: 'items of PlantTarget and PlantActualDetail breakdown model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: {
            actual: {
              type: 'array',
              items: getModelSchemaRef(PlantActualDetail, { includeRelations: true }),
            },
            target: {
              type: 'array',
              items: getModelSchemaRef(PlantTarget, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async findAnnualCo2Emission(): Promise<any> {
    return Promise.resolve(findAnnualCo2Emission)
  }
}

async function getLinTarget({ plant, yearRanges }: { yearRanges: number[]; plant: string }) {
  const filter = {
    fields: { target: true, year: true, plantId: true },
    where: { year: { between: [yearRanges.at(0), yearRanges.at(-1)] } },
    include: [
      {
        relation: 'plant',
        scope: {
          fields: { name: true, id: true },
          where: {
            ...(plant === 'all' ? {} : { name: { eq: plant } }),
            is_active: { eq: true },
          },
        },
      },
    ],
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-invalid-this
  const plantTargets: PlantTargetWithRelations[] = await this.plantTargetRepository.find(filter)
  const remappedPlantTargets = plantTargets
    .filter((_a) => !!_get(_a, 'plant.name'))
    .map((p) => ({
      year: p.year,
      target: p.target,
      plant: _get(p, 'plant.name'), // for debug
    }))

  // return groupBy(remappedPlantTargets, 'year') // for debug

  const grouped = remappedPlantTargets.reduce(
    (acc, c) => {
      if (acc[c.year]) {
        acc[c.year] += c.target
      } else {
        acc[c.year] = c.target
      }

      return acc
    },
    {} as Record<number, number>
  )

  return yearRanges.reduce(
    (acc, _year) => {
      if (grouped[_year]) {
        acc[_year] = grouped[_year]
      } else {
        acc[_year] = 0
      }

      return acc
    },
    {} as Record<number, number>
  )
}

async function getLineActual({
  yearStart,
  yearEnd,
  yearRanges,
  plant,
}: {
  yearStart: Date
  yearEnd: Date
  yearRanges: number[]
  plant: string
}) {
  const filter = {
    fields: { no_of_seedling: true, plantActualId: true },
    include: [
      {
        relation: 'plantActual',
        scope: {
          fields: { date_planted: true, plantId: true },
          where: { date_planted: { between: [yearStart, yearEnd] } },
          include: [
            {
              relation: 'plant',
              scope: {
                fields: { name: true, id: true },
                where: {
                  ...(plant === 'all' ? {} : { name: { eq: plant } }),
                  is_active: { eq: true },
                },
              },
            },
          ],
        },
      },
    ],
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-invalid-this
  const plantActualData: PlantActualDetailWithRelations[] = await this.plantActualDetailRepository.find(filter)

  const transformPlantActualData = plantActualData
    .filter((_a) => !!_get(_a, 'plantActual') && !!_get(_a, 'plantActual.plant.name'))
    .map((_a) => ({
      no_of_seedling: _a.no_of_seedling,
      date_planted: getYear(_get(_a, 'plantActual.date_planted')!),
      plant: _get(_a, 'plantActual.plant.name')!, // for debug
    }))

  const groupSeedlingByYear = transformPlantActualData.reduce(
    (acc, c) => {
      if (acc[c.date_planted]) {
        acc[c.date_planted] += c.no_of_seedling
      } else {
        acc[c.date_planted] = c.no_of_seedling
      }

      return acc
    },
    {} as Record<number, number>
  )

  const fillInEmptyYears = yearRanges.reduce(
    (acc, _year) => {
      if (groupSeedlingByYear[_year]) {
        acc[_year] = groupSeedlingByYear[_year]
      } else {
        acc[_year] = 0
      }

      return acc
    },
    {} as Record<number, number>
  )

  return fillInEmptyYears
}

const findAnnualCo2Emission = {
  emissionOffset: [
    43165, 50116, -759284.01999, -1345104.58173, -1341261.58173, -1345104.58173, -1361269.58173, -1345136.58173, -1340613.58173,
    -1345104.58173, -1341269.58173, -1345104.58173, -1361269.58173, -1345104.58173, -1344020.58173, -1345104.58173, -1350169.58173,
    -1345104.58173, -1341269.58173, -1345104.58173, -1341269.58173, -1345104.58173, -1341269.58173, -1345104.58173, -1341180.58173,
    -1345104.58173, -1341269.58173, -1345104.58173, -1341269.58173, -1345104.58173, -1368269.58173,
  ],
  years: [
    2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041,
    2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050,
  ],
  emission: [
    43165, 50116, 43167, 43165, 47008, 43165, 27000, 43133, 47656, 43165, 47000, 43165, 27000, 43165, 44249, 43165, 38100, 43165, 47000,
    43165, 47000, 43165, 47000, 43165, 47089, 43165, 47000, 43165, 47000, 43165, 20000,
  ],
}
