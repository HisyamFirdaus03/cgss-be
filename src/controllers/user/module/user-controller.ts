export namespace UserController {
  export const controller = 'User'
  export const v1 = {
    users: {
      login: {
        path: `/v1/users/login`,
        post: {
          resource: controller + '.v1.users.login.post',
          fn: `v1_users_login_post`,
        },
      },
      logout: {
        path: `/v1/users/logout`,
        get: {
          resource: controller + '.v1.users.logout.get',
          fn: `v1_users_logout_get`,
        },
      },
      count: {
        path: `/v1/users/count`,
        get: {
          resource: controller + '.v1.users.count.get',
          fn: `v1_users_count_get`,
        },
      },
      request_email_verification: {
        path: `/v1/users/request-email-verification`,
        post: {
          resource: controller + '.v1.users.request-email-verification.post',
          fn: `v1_users_request_email_verification_post`,
        },
      },
      request_password_reset: {
        path: `/v1/users/request-password-reset`,
        post: {
          resource: controller + '.v1.users.request-password-reset.post',
          fn: `v1_users_request_password_reset_post`,
        },
      },
      reset_password: {
        path: `/v1/users/reset-password`,
        post: {
          resource: controller + '.v1.users.reset-password.post',
          fn: `v1_users_reset_password_post`,
        },
      },
      verify_email: {
        path: '/v1/users/verify-email',
        get: {
          resource: controller + '.v1.users.verify-email.get',
          fn: 'v1_users_verify_email_get',
        },
      },
      id: {
        deactivate: {
          path: `/v1/users/{id}/deactivate`,
          del: {
            resource: controller + '.v1.users.id.deactivate.del',
            fn: `v1_users_id_deactivate_del`,
          },
        },
        reactivate: {
          path: `/v1/users/{id}/reactivate`,
          get: {
            resource: controller + '.v1.users.id.reactivate.get',
            fn: `v1_users_id_reactivate_get`,
          },
        },
        request_email_verification: {
          path: '/v1/users/{id}/request-email-verification',
          get: {
            resource: controller + '.v1.users.id.request-email-verification.get',
            fn: 'v1_users_id_request_email_verification_get',
          },
        },
        reset_password: {
          path: '/v1/users/{id}/reset-password',
          post: {
            resource: controller + '.v1.users.id.reset-password.post',
            fn: 'v1_users_id_reset_password_post',
          },
        },
        verify_email: {
          path: '/v1/users/{id}/verify-email',
          get: {
            resource: controller + '.v1.users.id.verify-email.get',
            fn: 'v1_users_id_verify_email_get',
          },
        },
        // root
        path: `/v1/users/{id}`,
        del: {
          resource: controller + '.v1.users.id.del',
          fn: `v1_users_id_del`,
        },
        update: {
          path: '/v1/users/{id}',
          patch: {
            resource: controller + '.v1.users.id.update.patch',
            fn: 'v1_users_id_update_patch',
          },
        },
        find: {
          path: '/v1/users/{id}',
          get: {
            resource: controller + '.v1.users.id.find.get',
            fn: 'v1_users_id_find_get',
          },
        },
      },
      //root
      update: {
        path: '/v1/users',
        patch: {
          resource: controller + '.v1.users.update.patch',
          fn: 'v1_users_update_patch',
        },
      },
      find: {
        path: '/v1/users',
        get: {
          resource: controller + '.v1.users.find.get',
          fn: 'v1_users_find_get',
        },
      },
    },
  }
}
