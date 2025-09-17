import { get, response } from '@loopback/rest'
import { authenticate } from '@loopback/authentication'

@authenticate.skip()
export class HealthController {
  constructor() {
  }

  @get('/health-check')
  @response(200, { description: 'healthcheck' })
  async healthCheck(): Promise<string> {
    console.log('HealthCheck')
    return 'ok'
  }
}
