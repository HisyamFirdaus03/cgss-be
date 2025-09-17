import { inject } from '@loopback/core'
import { repository } from '@loopback/repository'
import { HttpErrors } from '@loopback/rest'
import { HasherService, HasherServiceBindings } from '../../../../../common'
import { UserAccessGroup } from '../../../../../models'
import { UserAccessGroupRepository, UserRepository } from '../../../../../repositories'
import { UserUagService } from '../user-uag.service'

export namespace UserUagServiceProvider {
  export class v1 implements UserUagService.v1 {
    constructor(
      @inject(HasherServiceBindings.Service.Bcrypt) protected bcrypt: HasherService,
      @repository(UserRepository) protected userRepository: UserRepository,
      @repository(UserAccessGroupRepository) protected userAccessGroupRepository: UserAccessGroupRepository
    ) {}

    // user.groups
    async findUserAccessGroupsByUserId(userId: number | undefined): Promise<UserAccessGroup[]> {
      const count = await this.userRepository.count({ id: userId })
      if (count.count < 1) {
        throw new HttpErrors.NotFound('User not found')
      }

      return this.userRepository.userAccessGroups(userId).find()
    }

    async linkByUserAccessGroupId(
      userId: number | undefined,
      userAccessGroupId: number | undefined
    ): Promise<UserAccessGroup[]> {
      if (!userId || !userAccessGroupId) throw new HttpErrors.UnprocessableEntity('Invalid Request')

      const count = await this.userRepository.count({ id: userId })
      if (count.count < 1) {
        throw new HttpErrors.NotFound('User not found')
      }

      const userAccessGroups = await this.userRepository
        .userAccessGroups(userId)
        .find({ where: { id: userAccessGroupId } })

      if (userAccessGroups.length > 0) {
        return this.findUserAccessGroupsByUserId(userId)
      }

      try {
        await this.userRepository.userAccessGroups(userId).link(userAccessGroupId)
      } catch (e) {
        console.error(e)
      }

      return this.findUserAccessGroupsByUserId(userId)
    }

    async linkByUserAccessGroupName(
      userId: number | undefined,
      userAccessGroupName: string
    ): Promise<UserAccessGroup[]> {
      if (!userId) throw new HttpErrors.UnprocessableEntity('Invalid Request')

      const count = await this.userRepository.count({ id: userId })
      if (count.count < 1) {
        throw new HttpErrors.NotFound('User not found')
      }

      const userAccessGroup = await this.userAccessGroupRepository.findOne({ where: { name: userAccessGroupName } })
      if (!userAccessGroup?.id) {
        throw new HttpErrors.UnprocessableEntity('Invalid Request')
      }

      const userAccessGroups = await this.userRepository.userAccessGroups(userId).find({
        where: { id: userAccessGroup.id },
      })

      if (userAccessGroups.length > 0) {
        return this.findUserAccessGroupsByUserId(userId)
      }

      try {
        await this.userRepository.userAccessGroups(userId).link(userAccessGroup.id)
      } catch (e) {
        console.error(e)
      }

      return this.findUserAccessGroupsByUserId(userId)
    }

    async unlinkByUserAccessGroupId(
      userId: number | undefined,
      userAccessGroupId: number | undefined
    ): Promise<UserAccessGroup[]> {
      const count = await this.userRepository.count({ id: userId })
      if (count.count < 1) {
        throw new HttpErrors.NotFound('User not found')
      }

      try {
        await this.userRepository.userAccessGroups(userId).unlink(userAccessGroupId)
      } catch (e) {
        console.error(e)
      }

      return this.findUserAccessGroupsByUserId(userId)
    }

    async unlinkByUserAccessGroupName(
      userId: number | undefined,
      userAccessGroupName: string
    ): Promise<UserAccessGroup[]> {
      if (!userId) throw new HttpErrors.UnprocessableEntity('Invalid Request')

      const count = await this.userRepository.count({ id: userId })
      if (count.count < 1) {
        throw new HttpErrors.NotFound('User not found')
      }

      const userAccessGroup = await this.userAccessGroupRepository.findOne({ where: { name: userAccessGroupName } })
      if (!userAccessGroup?.id) {
        throw new HttpErrors.UnprocessableEntity('Invalid Request')
      }

      try {
        await this.userRepository.userAccessGroups(userId).unlink(userAccessGroup.id)
      } catch (e) {
        console.error(e)
      }

      return this.findUserAccessGroupsByUserId(userId)
    }

    async unlinkFromAllUserAccessGroups(userId?: number | undefined): Promise<UserAccessGroup[]> {
      if (!userId) throw new HttpErrors.UnprocessableEntity('Invalid Request')

      const count = await this.userRepository.count({ id: userId })
      if (count.count < 1) {
        throw new HttpErrors.NotFound('User not found')
      }

      try {
        await this.userRepository.userAccessGroups(userId).unlinkAll()
      } catch (e) {
        if (typeof e === 'object') {
          if (e.message.includes('fkValue')) {
            console.error('User already unlinked from all groups')
          } else {
            console.error(e)
          }
        } else {
          console.error(e)
        }
      }

      return this.findUserAccessGroupsByUserId(userId)
    }
  }
}
