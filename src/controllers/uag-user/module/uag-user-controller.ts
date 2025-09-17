export namespace UagUserController {
  export const controller = 'UserAccessGroup-User'
  export const v1 = {
    uags: {
      id: {
        users: {
          path: '/v1/uags/{id}/users',
          del: {
            resource: controller + '.v1.uags.id.users.del',
            fn: 'v1_uags_id_users_del',
          },
          get: {
            resource: controller + '.v1.uags.id.users.get',
            fn: 'v1_uags_id_users_get',
          },
          post: {
            resource: controller + '.v1.uags.id.users.post',
            fn: 'v1_uags_id_users_post',
          },
          fk: {
            path: '/v1/uags/{id}/users/{fk}',
            post: {
              resource: controller + '.v1.uags.id.users.fk.post',
              fn: 'v1_uags_id_users_fk_post',
            },
            del: {
              resource: controller + '.v1.uags.id.users.fk.del',
              fn: 'v1_uags_id_users_fk_del',
            },
          },
        },
      },
      name: {
        users: {
          path: '/v1/uags-name/{name}/users',
          del: {
            resource: controller + '.v1.uags-name.name.users.del',
            fn: 'v1_uagsName_name_users_del',
          },
          get: {
            resource: controller + '.v1.uags-name.name.users.get',
            fn: 'v1_uagsName_name_users_get',
          },
          post: {
            resource: controller + '.v1.uags-name.name.users.post',
            fn: 'v1_uagsName_name_users_post',
          },
          fk: {
            path: '/v1/uags-name/{name}/users/{fk}',
            post: {
              resource: controller + '.v1.uags-name.name.users.fk.post',
              fn: 'v1_uagsName_name_users_fk_post',
            },
            del: {
              resource: controller + '.v1.uags-name.name.users.fk.del',
              fn: 'v1_uagsName_name_users_fk_del',
            },
          },
        },
      },
      users: {
        reset: {
          path: '/v1/uags/users/reset',
          del: {
            resource: controller + '.v1.uags.users.reset.del',
            fn: 'v1_uags_users_reset_del',
          },
        },
      },

      admin: {
        users: {
          fk: {
            path: '/v1/uags/admin/users/{fk}',
            del: {
              resource: controller + '.v1.uags.admin.users.fk.del',
              fn: 'v1_uags_admin_user_fk_del',
            },
            put: {
              resource: controller + '.v1.uags.admin.users.fk.put',
              fn: 'v1_uags_admin_users_fk_put',
            },
          },
          path: '/v1/uags/admin/users',
          del: {
            resource: controller + '.v1.uags.admin.users.del',
            fn: 'v1_uags_admin_users_del',
          },
          get: {
            resource: controller + '.v1.uags.admin.users.get',
            fn: 'v1_uags_admin_users_get',
          },
          post: {
            resource: controller + '.v1.uags.admin.users.post',
            fn: 'v1_uags_admin_users_post',
          },
        },
      },
      guest: {
        users: {
          fk: {
            path: '/v1/uags/guest/users/{fk}',
            del: {
              resource: controller + '.v1.uags.guest.users.fk.del',
              fn: 'v1_uags_guest_users_fk_del',
            },
            put: {
              resource: controller + '.v1.uags.guest.users.fk.put',
              fn: 'v1_uags_guest_users_fk_put',
            },
          },
          path: '/v1/uags/guest/users',
          del: {
            resource: controller + '.v1.uags.guest.users.del',
            fn: 'v1_uags_guest_users_del',
          },
          get: {
            resource: controller + '.v1.uags.guest.users.get',
            fn: 'v1_uags_guest_users_get',
          },
          post: {
            resource: controller + '.v1.uags.guest.users.post',
            fn: 'v1_uags_guest_users_post',
          },
        },
      },
      member: {
        users: {
          fk: {
            path: '/v1/uags/member/users/{fk}',
            put: {
              resource: controller + '.v1.uags.member.users.fk.put',
              fn: 'v1_uags_member_users_put',
            },
            del: {
              resource: controller + '.v1.uags.member.users.fk.del',
              fn: 'v1_uags_member_users_fk_del',
            },
          },
          path: '/v1/uags/member/users',
          del: {
            resource: controller + '.v1.uags.member.users.del',
            fn: 'v1_uags_member_users_del',
          },
          get: {
            resource: controller + '.v1.uags.member.users.get',
            fn: 'v1_uags_member_users_get',
          },
          post: {
            resource: controller + '.v1.uags.member.users.post',
            fn: 'v1_uags_member_users_post',
          },
        },
      },
    },
  }
}
