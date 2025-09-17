import { injectable } from '@loopback/core'
// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/authentication-jwt"
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import { asSpecEnhancer, mergeOpenAPISpec, OASEnhancer, OpenApiSpec } from '@loopback/rest'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import debugModule from 'debug'
import { inspect } from 'util'
import { SecuritySchemeObjects } from '../../../types'

const debug = debugModule('loopback:jwt-extension:spec-enhancer')

/**
 * Authorization: Bearer <jwt>
 */
export const BEARER_OPERATION_SECURITY_SPEC = [{ jwt: [] }]

export const BEARER_SECURITY_SCHEME_SPEC: SecuritySchemeObjects = {
  jwt: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
}

/**
 * A spec enhancer to add bearer token OpenAPI security entry to
 * `spec.component.securitySchemes`
 */
@injectable(asSpecEnhancer)
export class BearerEnhancerImpl implements OASEnhancer {
  name = 'bearerAuth'

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const patchSpec = {
      components: {
        securitySchemes: BEARER_SECURITY_SCHEME_SPEC,
      },
      security: BEARER_OPERATION_SECURITY_SPEC,
    }
    const mergedSpec = mergeOpenAPISpec(spec, patchSpec)
    debug(`security spec extension, merged spec: ${inspect(mergedSpec)}`)
    return mergedSpec
  }
}
