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
            Usuario: {{ username }}
          </div>
          <!-- <q-space /> -->
          <div class="text-center">
            Rol: {{ rol.nombre }}
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
        <q-item-label header>
          <img class="fixed-top q-mr-auto q-ml-auto q-mt-xs" src="~assets/logo.jpg" alt="Logo"
            style="width: 100px; height: 80px">
        </q-item-label>

        <q-item-label header>
        </q-item-label>

        <q-item-label header>
          Navegación
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
import { defineComponent, onBeforeMount, ref } from 'vue'
import EssentialLink from 'src/modules/app/components/EssentialLink.vue'
import { linksListAdmin } from 'src/modules/app/router/link-list-admin';
import { linksListDig } from 'src/modules/app/router/link-list-dig';
import { linksListSup } from 'src/modules/app/router/link-list-sup';
import { useRouter } from 'vue-router';

import useAuth from 'src/modules/auth/composables/useAuth';
import useUI from 'src/modules/app/composables/useUI';
import { api } from 'src/boot/axios';


export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup() {
    // const leftDrawerOpen = ref(false)
    const router = useRouter()
    const { username, logout } = useAuth()

    const { sideMenuOpen, toggleSideMenu } = useUI()

    const data = ref([])

    const rol = ref([])

    const linksList = ref([])

    const getData = async () => {
      await api.get(`/users/username/${username.value}/`)
        .then(result => {
          data.value = result.data;
          rol.value = data.value.rol
          getOptions()
        })
        .catch(e => {
          console.log(e)
        })
    }

    const getOptions = () => {
      if (rol.value.nombre === 'Administrador') {
        linksList.value = linksListAdmin
      }
      if (rol.value.nombre === 'Supervisor') {
        linksList.value = linksListSup
      }
      if (rol.value.nombre === 'Digitador') {
        linksList.value = linksListDig
      }
    }

    onBeforeMount(() => {
      getData()
    })

    return {
      linksList,
      sideMenuOpen,
      toggleSideMenu,
      rol,

      username,
      onLogout: () => {
        router.push({ name: 'login' })
        rol.value = []
        logout()
      }
    }
  }
})
</script>
