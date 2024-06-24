import { computed } from 'vue'
import { useStore } from 'vuex'

const useUI = () => {
  const store = useStore()

  return {
    sideMenuOpen: computed({
      get() {
        return store.getters['ui/isSideMenuOpen']
      },
      set(val) {
        store.commit('ui/toggleSideMenu')
      }
    }),
    selectedMenuItem: computed({
      get() {
        return store.getters['ui/selectedMenuItem'];
      },
      set(val) {
        store.commit('ui/setSelectedMenuItem', val);
      },
    }),
    toggleSideMenu() {
      store.commit('ui/toggleSideMenu')
    },
    selectMenuItem(menuItem) {
      store.commit('ui/setSelectedMenuItem', menuItem);
    },
  }
}

export default useUI
