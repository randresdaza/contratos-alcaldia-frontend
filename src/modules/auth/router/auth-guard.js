import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';


export const isAuthenticatedGuard = async (to, from, next) => {
  const store = useStore()
  const { ok } = await store.dispatch('auth/checkAuthentication')
  if (!ok) return next({ name: 'login' })

  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null
  const { roles } = to.meta
  const userRole = user ? user.role.name : null

  if (roles && (!userRole || !roles.includes(userRole))) {
    return next({ name: 'not-found' })
  }
  next()
}

export const isAuthenticated = () => {
  const router = useRouter()
  const refresh = Cookies.get('refresh')
  if (refresh) {
    return router.push({ name: 'home' })
  }
}
