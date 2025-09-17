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
 * Authorization: <access_token>
 */
export const ACCESS_TOKEN_OPERATION_SECURITY_SPEC = [{ accessToken: [] }]

export const ACCESS_TOKEN_SECURITY_SCHEME_SPEC: SecuritySchemeObjects = {
  accessToken: {
    type: 'apiKey',
    name: 'access_token',
    in: 'header',
  },
}

/**
 * A spec enhancer to add bearer token OpenAPI security entry to
 * `spec.component.securitySchemes`
 */
@injectable(asSpecEnhancer)
export class AccessTokenEnhancerImpl implements OASEnhancer {
  name: 'access_token'

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const patchSpec = {
      components: {
        securitySchemes: ACCESS_TOKEN_SECURITY_SCHEME_SPEC,
      },
      security: ACCESS_TOKEN_OPERATION_SECURITY_SPEC,
    }
    const mergedSpec = mergeOpenAPISpec(spec, patchSpec)
    debug(`security spec extension, merged spec: ${inspect(mergedSpec)}`)
    return mergedSpec
  }
}
