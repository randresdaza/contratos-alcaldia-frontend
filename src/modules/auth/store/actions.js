import Cookies from 'js-cookie';
import { api, noAuthApi } from 'src/boot/axios';


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
    if (access) {
      commit('loginUser', { access, refresh, user })
      return { ok: true, message: message }
    } else {
      return { ok: false, message: message }
    }
  } catch (error) {
    return { ok: false, message: error.response.data.error }
  }
}

export const checkAuthentication = async ({ dispatch, commit }) => {
  const accessToken = Cookies.get('access')
  const refreshToken = Cookies.get('refresh')
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null
  if (!accessToken || !user) {
    commit('logout')
    return { ok: false, message: 'No hay token.' }
  }
  try {
    const { data } = await api.post('/refresh/', { refresh: refreshToken })
    const { access, refresh } = data
    commit('loginUser', { user, access, refresh })
    return { ok: true }
  } catch (error) {
    if (!accessToken || !user) {
      commit('logout')
      return { ok: false, message: 'No hay token.' }
    } else {
      await dispatch('logout')
    }
    return { ok: false, message: error.response.data.message }
  }
}

export const checkAuth = async ({ commit }) => {
  const refresh = Cookies.get('refresh')
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null
  if (!refresh || !user) {
    commit('logout')
    return { ok: false, message: 'No hay token.' }
  } else {
    return { ok: true }
  }
}

export const logout = async ({ commit }) => {
  const refresh = Cookies.get('refresh')
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null
  if (!refresh || !user) {
    commit('logout')
    return { ok: false, message: 'No hay token.' }
  }
  try {
    const { username } = user
    const { data } = await noAuthApi.post('/logout/', { username, refresh })
    const { message } = data
    commit('logout')
    return { ok: true, message: message }
  } catch (error) {
    commit('logout')
    return { ok: false, message: 'Su sesión ha expirado' }
  }
}
