import { Entity, model, property } from '@loopback/repository'

@model()
export class Permission extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'string',
    required: true,
    index: { unique: true },
  })
  name: string

  @property({ type: 'string' })
  description?: string

  @property({
    type: 'date',
    defaultFn: 'now',
    mysql: {
      type: 'datetime',
    },
  })
  createdAt?: string

  @property({
    type: 'date',
    defaultFn: 'now',
    mysql: {
      type: 'datetime',
    },
  })
  updatedAt?: string

  constructor(data?: Partial<Permission>) {
    super(data)
  }
}

export interface PermissionRelations {
}

export type PermissionWithRelations = Permission & PermissionRelations


