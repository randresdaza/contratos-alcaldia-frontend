<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="q-ma-xs">
        <q-btn flat dense round icon="las la-bars" aria-label="Menu" @click="toggleSideMenu" />

        <q-toolbar-title>
          Alcaldía Municipal de Valledupar - Gestión de Contratos
        </q-toolbar-title>

        <div class="q-pa-xs q-ma-xs q-mr-md">
          <div class="text-center">
            Usuario: {{ currentUser.username }}
          </div>

          <div class="text-center">
            Rol: {{ currentUser.role.name }}
          </div>
        </div>

        <div class="q-pa-xs">
          <q-btn push color="standard" @click="onLogout">
            <q-icon left size="3em" name="las la-sign-out-alt" />
            <div>Salir</div>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="sideMenuOpen" show-if-above bordered>
      <q-list>
        <q-item-label>
          <img class="row justify-center q-ml-auto q-mr-auto q-mt-xs" src="~assets/logo.jpg" alt="Logo"
            style="width: 150px; height: 100px">
        </q-item-label>

        <q-item-label class="q-ml-md q-mb-xs q-pt-xs" style="font-weight: bold; font-size: 16px; color: black;">
          Menú de Navegación
        </q-item-label>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import EssentialLink from 'src/modules/app/components/EssentialLink.vue'
import { linksListAdmin } from 'src/modules/app/router/link-list-admin';
import { linksListDig } from 'src/modules/app/router/link-list-dig';
import { linksListSup } from 'src/modules/app/router/link-list-sup';
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';
import useUI from 'src/modules/app/composables/useUI';
import Swal from 'sweetalert2';


export default defineComponent({
  name: 'MainLayout',
  components: {
    EssentialLink
  },
  setup() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { sideMenuOpen, toggleSideMenu, selectedMenuItem } = useUI()
    const currentUser = ref(user.value)

    const linksList = computed(() => {
      switch (currentUser.value.role.name) {
        case 'Administrador':
          return linksListAdmin
        case 'Supervisor':
          return linksListSup
        case 'Digitador':
          return linksListDig
        default:
          return []
      }
    })

    return {
      linksList,
      sideMenuOpen,
      toggleSideMenu,
      currentUser,
      selectedMenuItem,

      onLogout: async () => {
        const { ok, message } = await logout()
        if (!ok) {
          Swal.fire('', message, 'info')
        }
        else {
          Swal.fire('Exito', message, 'success')
        }
        router.push({ name: 'login' })
      }
    }
  }
})
</script>

<style scoped>
.responsive-image {
  max-width: 100%;
}
</style>
