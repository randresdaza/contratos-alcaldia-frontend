import authRouter from '../modules/auth/router';
import { isAuthenticatedGuard, isAuthenticated } from 'src/modules/auth/router/auth-guard';
import appRouter from '../modules/app/router';

const routes = [
  {
    path: '/',
    beforeEnter: [isAuthenticatedGuard],
    ...appRouter
  },
  {
    path: '/auth',
    beforeEnter: [isAuthenticated],
    ...authRouter
  },
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
