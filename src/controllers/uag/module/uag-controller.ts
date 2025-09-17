export namespace UserAccessGroupsController {
  export const controller = 'UserAccessGroup'
  export const v1 = {
    uag: {
      //root
      path: '/v1/uags',
      get: {
        resource: controller + '.v1.uags.get',
        fn: 'v1_uags_get',
      },
    },
  }
}
