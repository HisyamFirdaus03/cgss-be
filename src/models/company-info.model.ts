import { Entity, model, property } from '@loopback/repository'

@model()
export class CompanyInfo extends Entity {
  @property({ type: 'number', id: true, generated: true })
  id?: number

  @property({ type: 'string', required: true, index: { unique: true } })
  name: string

  @property({ type: 'string', required: true, index: { unique: true } })
  slug: string

  @property({ type: 'array', itemType: 'string', required: true })
  features: string[] // plant, emission

  @property({ type: 'date', mysql: { dataType: 'datetime' }, required: false })
  expiredAt?: Date

  @property({ type: 'string', required: true, jsonSchema: { enum: ['blue', 'green'] } })
  theme: 'blue' | 'green'

  @property({ type: 'object', required: false })
  addresses: string[]

  @property({ type: 'object', required: false })
  contactInfo: object // PIC, name phone number

  @property({ type: 'object', required: false })
  metadata: Partial<{
    icon: string
    maxGroups: boolean
    financialYearStartMonth: undefined | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    // if undefined then jan-dec
    // if 4 then 2024:April-2025:March
  }>

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<CompanyInfo>) {
    super(data)
  }
}

export interface CompanyInfoRelations {
  // describe navigational properties here
}

export type CompanyInfoWithRelations = CompanyInfo & CompanyInfoRelations
