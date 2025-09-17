import { Entity, model, property } from '@loopback/repository'

// https://loopback.io/doc/en/lb4/Model.html#array-property-decorator
@model({ settings: { scope: { order: 'year DESC' } } })
export class EmissionFactor extends Entity {
  @property({ type: 'number', id: true, generated: true })
  id?: number

  @property({ type: 'number', required: true, index: { unique: true } })
  year: number

  @property({ type: 'array', itemType: 'object', required: true })
  stationary_combustion: {
    state: string
    unit: string
    fuel_types: string
    name: string
    heat_content: number
    CO2: number
    CH4: number
    N2O: number
    id: string // state + kebabCase(name)
  }[]

  @property({ type: 'object', required: true })
  mobile_combustion: {
    litre: { id: string; fuel_type: string; CO2: number; CH4: number; N2O: number }[]
    distance: {
      vehicle_type: string
      fuel_type: string
      CO2: number
      CH4: number
      N2O: number
      litreId: string // this will point to litre > id above
      id: string // kebabCase(vehicle_type + '-' + fuel_type)
    }[]
  }

  @property({ type: 'object', required: true })
  scope2: {
    electric: { peninsular: number; sabah: number; sarawak: number; unit: string }
    steam: { CO2: number; CH4: number; N2O: number }
    cooling: { CO2: number; CH4: number; N2O: number }
    heat: { CO2: number; CH4: number; N2O: number }
  }

  @property({ type: 'array', itemType: 'object', required: true })
  GWP: {
    id: string
    name: string
    symbol: string
    value: number
  }[]

  @property({ type: 'array', itemType: 'object', required: true })
  waste_generated: {
    id: string // generated slug from material
    material: string
    recycled: number | null
    landfilled: number
    combusted: number | null
    composted: number | null
    anaerobically_digested_dry: number | null
    anaerobically_digested_wet: number | null
  }[]

  @property({ type: 'array', itemType: 'object', required: true })
  waste_generated_supplier_specific_method: {
    id: string,
    name: string,
    value: number,
  }[]

  constructor(data?: Partial<EmissionFactor>) {
    super(data)
  }
}

export interface EmissionFactorRelations {
  // describe navigational properties here
}

export type EmissionFactorWithRelations = EmissionFactor & EmissionFactorRelations
