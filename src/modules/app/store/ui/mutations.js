export function toggleSideMenu(state) {
  state.isSideMenuOpen = !state.isSideMenuOpen
}

export function setSelectedMenuItem(state, menuItem) {
  state.selectedMenuItem = menuItem
}
