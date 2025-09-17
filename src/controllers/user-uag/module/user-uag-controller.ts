export namespace UserUagController {
  export const controller = 'User-UserAccessGroup'

  export const v1 = {
    users: {
      id: {
        uag: {
          path: '/v1/users/{id}/uag',
          get: {
            resource: controller + '.v1.users.id.get',
            fn: 'v1_users_id_get',
          },
          del: {
            resource: controller + '.v1.users.id.del',
            fn: 'v1_users_id_del',
          },
          fk: {
            path: '/v1/users/{id}/uag/{fk}',
            post: {
              resource: controller + '.v1.users.id.uag.fk.post',
              fn: 'v1_users_id_uag_fk_post',
            },
            del: {
              resource: controller + '.v1.users.id.uag.fk.del',
              fn: 'v1_users_id_uag_fk_del',
            },
          },
          name: {
            path: '/v1/users/{id}/uag/by-name/{name}',
            post: {
              resource: controller + '.v1.users.id.uag.name.post',
              fn: 'v1_users_id_uag_name_post',
            },
            del: {
              resource: controller + '.v1.users.id.uag.name.del',
              fn: 'v1_users_id_uag_name_del',
            },
          },
        },
      },
    },
  }
}
