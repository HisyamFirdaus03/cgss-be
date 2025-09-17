import { ReferenceObject, SecuritySchemeObject } from '@loopback/rest'

export type SecuritySchemeObjects = {
  [securityScheme: string]: SecuritySchemeObject | ReferenceObject
}
