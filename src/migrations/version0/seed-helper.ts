import { random } from 'lodash'
import { faker } from '@faker-js/faker'

// createdAt and updatedAt
export const s = () => {
  const createdAt = faker.date.future({ years: 1 })
  return { createdAt: createdAt + '', updatedAt: faker.date.future({ refDate: createdAt }) + '' }
}

export const arraySize = <T>(filled: (i: number) => T, length: { min: number; max: number } = { min: 2, max: 5 }): T[] => {
  return Array.from({ length: faker.string.alpha({ length }).length })
    .fill(undefined)
    .map((_, i) => filled(i)) as T[]
}

export const getRandomItem = <T>(obj: T[]): T => obj[random(0, obj.length - 1)]

export const timeStampSeed = (userIds: { id: number }[]) => {
  const flattenIds = userIds.map((i) => i.id)

  const createdAt = faker.date.future({ years: 1 })
  const createdId = getRandomItem(flattenIds)

  const updatedId = getRandomItem([undefined, ...flattenIds.filter((i) => i !== createdId)])
  const updatedAt = updatedId ? faker.date.future({ refDate: createdAt }) : undefined

  return {
    createdAt,
    createdId,
    updatedId,
    updatedAt,
    /* deletedBy: 1 */
  }
}
