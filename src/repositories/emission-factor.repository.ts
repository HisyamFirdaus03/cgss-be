import { inject } from '@loopback/core'
import { DefaultCrudRepository } from '@loopback/repository'
import { EmissionFactor, EmissionFactorRelations } from '../models'
import { MainDatasource } from '../datasources'
import { Dictionary, kebabCase, keyBy, merge, pick, sortBy } from 'lodash'

// @ts-ignore
import { Filter } from '@loopback/filter/src/query'
import { HttpErrors } from '@loopback/rest'
import { gwp_symbols } from '../common/emission-common'

export type EF_Transformed = {
  // not hashed yet, since have diff structure
  scope2: EmissionFactor['scope2']
  // hashed
  mobile_combustion: {
    litre: Dictionary<EmissionFactor['mobile_combustion']['litre'][0]>
    distance: Dictionary<EmissionFactor['mobile_combustion']['distance'][0]>
  }
  stationary_combustion: Dictionary<EmissionFactor['stationary_combustion'][0]>
  GWP: Record<(typeof gwp_symbols)[number], number>
  waste_generated: Dictionary<EmissionFactor['waste_generated'][0]>
  waste_generated_supplier_specific_method: Dictionary<EmissionFactor['waste_generated_supplier_specific_method'][0]>
}

type MapYearToEmissionFactors = Record<string, /* year */ EF_Transformed>

export class EmissionFactorRepository extends DefaultCrudRepository<
  EmissionFactor,
  typeof EmissionFactor.prototype.id,
  EmissionFactorRelations
> {
  constructor(@inject('datasources.db.cgss__main') dataSource: MainDatasource) {
    super(EmissionFactor, dataSource)
  }

  async initEmissionFactor(fields: Filter<EmissionFactor>) {
    const ef = await this.find({ fields: { GWP: true, year: true, ...fields } })
    if (ef.length === 0) throw Error('please add more emission factor')
    return ef
  }

  analysisEmissionFactor = async (
    field: Filter<EmissionFactor> = {
      stationary_combustion: true,
      mobile_combustion: true,
      scope2: true,
      waste_generated: true,
      waste_generated_supplier_specific_method: true,
    },
    EF?: EmissionFactor[],
  ): Promise<{
    minYear: number
    maxYear: number
    emissionFactorYears: number[]
    mapYearsToEmissionFactors: MapYearToEmissionFactors
    selectProperYear: (year: string | number) => number
  }> => {
    if (!EF) EF = await this.initEmissionFactor(field)

    const emissionFactorYears = EF.map((i) => i.year)
    const minYear = Math.min(...emissionFactorYears)
    const maxYear = Math.min(...emissionFactorYears)

    const mapYearsToEmissionFactors = EF.reduce(
      (acc, c) => {
        // @ts-ignore
        acc[c.year] = merge(
          {},
          c,
          field?.stationary_combustion ? { stationary_combustion: keyBy(c.stationary_combustion, 'id') } : {},
          field?.waste_generated ? { waste_generated: keyBy(c.waste_generated, 'id') } : {},
          field?.waste_generated_supplier_specific_method
            ? { waste_generated_supplier_specific_method: keyBy(c.waste_generated_supplier_specific_method, 'id') }
            : {},
          field?.mobile_combustion
            ? {
              mobile_combustion: {
                litre: keyBy(c.mobile_combustion.litre, 'id'),
                distance: keyBy(c.mobile_combustion.distance, 'id'),
              },
            }
            : {},
        )

        acc[c.year].GWP = c.GWP.reduce<EF_Transformed['GWP']>(
          (acc, gwp) => {
            // @ts-ignore
            if (gwp_symbols.includes(gwp.symbol)) acc[gwp.symbol] = gwp.value
            return acc
          },
          {} as EF_Transformed['GWP'],
        )

        return acc
      },
      {} as Record<string, EF_Transformed>,
    )

    // for each year, we need to resolve the nearest year and correct id and grab co2, ch4 ...
    const selectProperYear = (year: string | number): number => {
      const ret = mapYearsToEmissionFactors[year]
        ? +year
        : minYear === maxYear
          ? minYear
          : +year <= minYear
            ? minYear
            : +year >= maxYear
              ? maxYear : 'unableToDecide' // prettier-ignore

      if (typeof ret === 'string') throw Error(`please add more emission factor year: ${year}, [${minYear}, ${maxYear}]`)

      return ret as number
    }

    return {
      minYear,
      maxYear,
      emissionFactorYears,
      mapYearsToEmissionFactors,
      selectProperYear,
    }
  }

  dropdown = async <T extends TDropdown>(field: T) => {
    const res = await this.find({ fields: [field, 'year'], order: ['year DESC'], limit: 1 })

    const mapper = {
      stationary_combustion: (a: EmissionFactor['stationary_combustion']) =>
        a.map((_) => ({
          id: _.state + '-' + kebabCase(_.name),
          ...pick(_, ['state', 'unit', 'fuel_types', 'name']),
        })),

      mobile_combustion: (a: EmissionFactor['mobile_combustion']) => ({
        litre: a.litre.map((_) => pick(_, ['id', 'fuel_type'])),
        distance: a.distance.map((_) => pick(_, ['id', 'fuel_type', 'litreId', 'vehicle_type'])),
      }),

      GWP: (a: EmissionFactor['GWP']) => a.map((_) => pick(_, ['id', 'symbol', 'name'])),

      waste_generated: (a: EmissionFactor['waste_generated']) => sortBy(a.map(_ => {
        return {
          id: _.id,
          material: _.material,
          // @ts-ignore
          methods: this.waste_generated()['waste_type_specific_method'].filter(m => _[m.id]),
        }
      }), 'material'),

      waste_generated_supplier_specific_method: (a: EmissionFactor['waste_generated_supplier_specific_method']) => {
        return this.waste_generated().supplier_specific_method
      },
    } as const

    if (!mapper) throw new HttpErrors[403]('Invalid field')

    return mapper[field](res[0][field] as any) as ReturnType<(typeof mapper)[T]>
  }

  waste_generated = () => {
    return {
      waste_type_specific_method: [
        { id: 'recycled', name: 'Recycled' },
        { id: 'landfilled', name: 'Landfilled' },
        { id: 'combusted', name: 'Combusted' },
        { id: 'composted', name: 'Composted' },
        { id: 'anaerobically_digested_dry', name: 'Anaerobically Digested (Dry)' },
        { id: 'anaerobically_digested_wet', name: 'Anaerobically Digested (Wet)' },
      ],
      supplier_specific_method: [
        { id: 'wmc_treated_waste', name: 'Municipal Solid Waste treated waste' },
        { id: 'thermal_treatment_of_incinerable_waste', name: 'Thermal treatment of incinerable' },
        { id: 'secured_landfill_of_inert_wastes', name: 'Secured landfill of incinerable' },
        { id: 'solidification_of_inorganic_wastes', name: 'Solidification of inorganic wastes' },
        { id: 'physical_chemical_treatment_of_liquid_wastes', name: 'Physical Chemical' },
        { id: 'all_crr_output', name: 'All Carbon recovery and re-utilization (CRR) Output' },
      ],
    }
  }
}

type TDropdown =
  'mobile_combustion'
  | 'stationary_combustion'
  | 'GWP'
  | 'waste_generated'
  | 'waste_generated_supplier_specific_method'

export const findMobileCombustion = (
  mobile_combustion: MapYearToEmissionFactors['']['mobile_combustion'],
  EF_MobileCombustionDistanceId: string,
) => {
  const { distance, litre } = mobile_combustion
  const EF_MC_distance = distance[EF_MobileCombustionDistanceId]

  if (!EF_MC_distance) {
    throw new HttpErrors[500](`findMobileCombustion not able to find mobileCombustion with distance: ${EF_MobileCombustionDistanceId}`)
  }

  const EF_MC_litre = litre?.[EF_MC_distance?.litreId] ?? undefined
  return {
    ...EF_MC_distance,
    ...(EF_MC_litre ? { litre: EF_MC_litre } : {}),
  }
}