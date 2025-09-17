import { Constructor, Getter, inject } from '@loopback/core'
import { Count, Where, Entity, EntityCrudRepository, BelongsToAccessor } from '@loopback/repository'
import { DataObject, Options } from '@loopback/repository/src/common-types'
import { User } from '../models'
import { UserRepository } from '../repositories/user.repository'
import { SecurityBindings, securityId, UserProfile } from '@loopback/security'

export function TimeStampRepositoryMixin<
  E extends Entity & { createdAt: Date; updatedAt: Date; deletedAt: Date; createdId: ID; updatedId?: ID; deleteId?: ID },
  ID,
  R extends Constructor<EntityCrudRepository<E, ID>>, // R usually is DefaultCrudRepository
>(Repository: R) {
  class MixedRepository extends Repository {
    @inject(SecurityBindings.USER, { optional: true }) user: UserProfile

    public createdBy: BelongsToAccessor<User, ID>
    public updatedBy: BelongsToAccessor<User, ID>
    public deletedBy: BelongsToAccessor<User, ID>

    userRepositoryGetter: Getter<UserRepository>

    constructor(...args: any[]) {
      super(...args)

      // @ts-ignore
      this.createdBy = this.createBelongsToAccessorFor('createdBy', this.userRepositoryGetter)
      // @ts-ignore
      this.registerInclusionResolver('createdBy', this.createdBy.inclusionResolver)

      // @ts-ignore
      this.updatedBy = this.createBelongsToAccessorFor('updatedBy', this.userRepositoryGetter)
      // @ts-ignore
      this.registerInclusionResolver('updatedBy', this.updatedBy.inclusionResolver)

      // @ts-ignore
      this.deletedBy = this.createBelongsToAccessorFor('deletedBy', this.userRepositoryGetter)
      // @ts-ignore
      this.registerInclusionResolver('deletedBy', this.deletedBy.inclusionResolver)
    }

    async create(entity: DataObject<E>, options?: Options): Promise<E> {
      entity.createdAt = new Date()
      entity.updatedAt = new Date()
      entity.createdId = this.#userId
      entity.updatedId = this.#userId

      return super.create(entity, options)
    }

    async updateAll(data: DataObject<E>, where?: Where<E>, options?: Options): Promise<Count> {
      data.updatedAt = new Date()
      data.updatedId = this.#userId
      return super.updateAll(data, where, options)
    }

    async replaceById(id: ID, data: DataObject<E>, options?: Options): Promise<void> {
      data.updatedAt = new Date()
      data.updatedId = this.#userId
      return super.replaceById(id, data, options)
    }

    softDeleteId(id: ID): Promise<void> {
      return super.updateById(id, { deleteId: this.#userId, deletedAt: new Date() })
    }

    get #userId() {
      // have to do this, because seeding will also use createdId, updatedId, deleteId,
      const userId = this.user?.[securityId]
      return userId ? +userId : undefined
    }
  }

  return MixedRepository
}
