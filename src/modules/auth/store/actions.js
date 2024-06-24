import Cookies from 'js-cookie';
import { api } from 'src/boot/axios';


// export const createUser = async ({ commit }, user) => {
//   const { name, email, password } = user
//   try {
//     const { data } = await api.post(':signUp', { email, password, returnSecureToken: true })
//     const { idToken, refreshToken } = data
//     await api.post(':update', { displayName: name, idToken })
//     delete user.password
//     commit('loginUser', { user, idToken, refreshToken })
//     return { ok: true }
//   } catch (error) {
//     return { ok: false, message: error.response.data.error.message }
//   }
// }

export const signInUser = async ({ commit }, user) => {
  const { username, password } = user
  try {
    const { data } = await api.post('/login/', { username, password })
    const { access, refresh, message, user } = data
    commit('loginUser', { access, refresh, user })
    return { ok: true, message: message }
  } catch (error) {
    return { ok: false, message: error.response.data.error }
  }
}

export const checkAuthentication = async ({ commit }) => {
  const access = Cookies.get('access')
  const refresh = Cookies.get('refresh')
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null
  if (!access || !user) {
    commit('logout')
    return { ok: false, message: 'No hay token.' }
  }
  try {
    const { data } = await api.post('/refresh/', { refresh })
    const { accessToken, refreshToken } = data
    commit('loginUser', { user, accessToken, refreshToken })
    return { ok: true }
  } catch (error) {
    commit('logout')
    return { ok: false, message: error.response.data.message }
  }
}
