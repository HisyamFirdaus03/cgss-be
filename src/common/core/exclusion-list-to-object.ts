import { getJsonSchema, JsonSchemaOptions, Model, SchemaObject } from '@loopback/rest'

export function exclusionListToObject(list: string[]): object {
  const exclusion: { [key: string]: boolean } = {}

  for (const item1 of list) {
    const item = item1 as string
    exclusion[item] = false
  }
  return exclusion
}

/**
 * **Unstable**!!!
 * Wrapper for `getJsonSchema`. A model in the query is not properly parsed
 * by the loopback middleware. The `@param.query.object` expects a `SchemaObject`
 * but `getJsonSchema` returns `JsonSchema7`,  a simple cast to `SchemaObject`
 * works.
 * @param modelCtor Constructor of a class to get JsonSchema from
 * @param options  standard JsonSchemaOptions.
 * @returns SchemaObject of `modelCtor`
 */
export function getModelSchemaObject(modelCtor: typeof Model, options: JsonSchemaOptions<Model> = {}): SchemaObject {
  return getJsonSchema(modelCtor, options) as SchemaObject
}
