import authRouter from '../modules/auth/router';
import isAuthenticatedGuard from 'src/modules/auth/router/auth-guard';
import appRouter from '../modules/app/router';


const routes = [
  {
    path: '/',
    redirect: '/app'
  },
  {
    path: '/auth',
    ...authRouter
  },
  {
    path: '/app',
    name: 'home',
    beforeEnter: [isAuthenticatedGuard],
    ...appRouter
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
