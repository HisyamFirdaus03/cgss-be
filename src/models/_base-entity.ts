import { Entity, model, property } from '@loopback/repository'

@model()
export class BaseEntity extends Entity {
  @property({ type: 'date', defaultFn: 'now', mysql: { dataType: 'datetime' } }) createdAt: Date
  @property({ type: 'date', defaultFn: 'now', mysql: { dataType: 'datetime' } }) updatedAt: Date
  @property({ type: 'date', mysql: { dataType: 'datetime' } }) deletedAt: Date

  constructor(data?: Partial<BaseEntity>) {
    super(data)
  }
}
