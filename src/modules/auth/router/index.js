export default {
  path: '/auth',
  redirect: { name: 'login' },
  component: () => import('src/modules/auth/layouts/Auth.vue'),
  children: [
    {
      path: 'login',
      name: 'login',
      component: () => import('src/modules/auth/pages/Login.vue'),
    }
  ]
}
