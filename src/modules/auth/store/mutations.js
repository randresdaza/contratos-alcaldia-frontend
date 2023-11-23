export const loginUser = (state, { username, access, refresh }) => {
  if (access) {
    localStorage.setItem('access', access)
    state.accessToken = access
  }
  if (refresh) {
    localStorage.setItem('refresh', refresh)
    state.refreshToken = refresh
  }
  if (username) {
    localStorage.setItem('user', username)
    state.user = username
  }
  state.status = 'authenticated'
}

export const logout = (state) => {
  state.user = null
  state.accessToken = null
  state.refreshToken = null
  state.status = 'not-authenticated'

  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
}
