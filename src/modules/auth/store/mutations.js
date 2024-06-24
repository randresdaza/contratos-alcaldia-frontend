import Cookies from "js-cookie"

export const loginUser = (state, { access, refresh, user }) => {
  if (access) {
    Cookies.set('access', access, { expires: 1, secure: true, sameSite: 'Strict' })
  }
  if (refresh) {
    Cookies.set('refresh', refresh, { expires: 1, secure: true, sameSite: 'Strict' })
  }
  if (user) {
    Cookies.set('user', JSON.stringify(user), { expires: 1, secure: true, sameSite: 'Strict' })
    state.user = user
  }
  state.status = 'authenticated'
}

export const logout = (state) => {
  state.user = null
  state.status = 'not-authenticated'

  Cookies.remove('access')
  Cookies.remove('refresh')
  Cookies.remove('user')
}
