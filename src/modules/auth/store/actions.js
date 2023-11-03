

// export const myAction = async ({commit}) => {


// }

import { api } from 'src/boot/axios';


export const createUser = async ({ commit }, user) => {
  const { name, email, password } = user

  try {
    const { data } = await api.post(':signUp', { email, password, returnSecureToken: true })
    const { idToken, refreshToken } = data

    await api.post(':update', { displayName: name, idToken })

    delete user.password
    commit('loginUser', { user, idToken, refreshToken })

    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.response.data.error.message }
  }
}

export const signInUser = async ({ commit }, user) => {
  const { username, password } = user

  try {

    const { data } = await api.post('/login/', { username, password })

    const { access, refresh } = data

    commit('loginUser', { username, access, refresh })

    return { ok: true }
  } catch (error) {
    if (error.response.status == "401") return { ok: false, message: 'Las credenciales son incorrectas' }
  }
}

export const checkAuthentication = async ({ commit }) => {

  const access = localStorage.getItem('access')
  const refresh = localStorage.getItem('refresh')
  const username = localStorage.getItem('user')

  if (!access) {
    commit('logout')
    return { ok: false, message: 'No hay token' }
  }

  try {
    const { data } = await api.post('/refresh/', { refresh })
    const { access } = data
    commit('loginUser', { username, access, refresh })
    return { ok: true }
  } catch (error) {
    commit('logout')
    return { ok: false, message: error.response.data.message }
  }

}
