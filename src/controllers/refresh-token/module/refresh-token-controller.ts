export namespace RefreshTokensController {
  export const controller = 'RefreshToken'
  export const v1 = {
    refresh_tokens: {
      users: {
        path: `/v1/refresh-tokens/users`,
        get: {
          resource: controller + '.v1.refresh-tokens_user.get',
          fn: `v1_refresh_token_users_get`,
        },
      },
      //root
      path: '/v1/refresh-tokens',
      get: {
        resource: controller + '.v1.refresh-tokens.get',
        fn: `v1_refresh_tokens_get`,
      },
    },
  }
}
