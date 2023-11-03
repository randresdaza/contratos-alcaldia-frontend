// import store from "src/store";
import { useStore } from 'vuex';


const isAuthenticatedGuard = async (to, from, next) => {
    const store = useStore()

    const { ok } = await store.dispatch('auth/checkAuthentication')

    if (ok) next()
    else next({ name: 'login' })
}

export default isAuthenticatedGuard