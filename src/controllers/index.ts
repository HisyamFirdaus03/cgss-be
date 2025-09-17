import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { RefreshTokenComponent } from './refresh-token/module'
import { UagUserComponent } from './uag-user/module'
import { UagComponent } from './uag/module'
import { UserUagComponent } from './user-uag/module'
import { UserComponent } from './user/module'
import { UsrDetailComponent } from './usr-detail/module'

export class ControllerComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(RefreshTokenComponent)
    app.component(UagComponent)
    app.component(UagUserComponent)
    app.component(UserComponent)
    app.component(UserUagComponent)
    app.component(UsrDetailComponent)
  }
}

export * from './health.controller'
export * from './home.controller'
export * from './plants/plant.controller'
export * from './plants/plant-actual.controller'
export * from './plants/plant-actual-detail.controller'
export * from './plants/plant-species.controller'
export * from './plants/plant-target.controller'
export * from './plants/plant-url.controller'
export * from './plants/plant-growth.controller'
export * from './plants/plant-category-controller.controller'

export * from './emissions/emission-factor.controller'
export * from './emissions/group-by.controller'
export * from './emissions/mobile-registry.controller'

export * from './emissions/emission-scope-1-fugitive-emission.controller'
export * from './emissions/emission-scope-1-process-emission.controller'
export * from './emissions/emission-scope-1-stationary-combustion.controller'
export * from './emissions/emission-scope-1-mobile-combustion.controller'

export * from './emissions/emission-scope-1-fugitive-emission-activity.controller'
export * from './emissions/emission-scope-1-process-emission-activity.controller'
export * from './emissions/emission-scope-1-stationary-combustion-activity.controller'
export * from './emissions/emission-scope-1-mobile-combustion-activity.controller'

export * from './emissions/emission-scope-2.controller'
export * from './emissions/emission-scope-2-activity.controller'

export * from './emissions/employee-registry-controller.controller'
export * from './emissions/emission-scope-3-employee-commuting.controller'
export * from './emissions/emission-scope-3-employee-commuting-activity.controller'

export * from './emissions/emission-scope-3-business-travel.controller'
export * from './emissions/emission-scope-3-upstream-downstream-transportation-and-distribution.controller'

export * from './company-info.controller'
export * from './configuration.controller'
