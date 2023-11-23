<template>
  <q-page class="flex flex-center">
    <img alt="Logo Alcaldía" src="~assets/logo_alcaldia.png" style="width: 500px; height: 250px" class="responsive-image">
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import useAuth from 'src/modules/auth/composables/useAuth';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const { logout, checkAuthStatus } = useAuth()
    const router = useRouter()
    const resp = checkAuthStatus()

    resp.then((resp) => {
      if (resp.ok === false) {
        Swal.fire(
          'Error',
          'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
          'info',
        ).then((result) => {
          if (result.isConfirmed) {
            logout()
            router.push({ name: 'login' })
          } else {
            logout()
            router.push({ name: 'login' })
          }
        })
      }
    })
  }
})
</script>

<style scoped>
.responsive-image {
  max-width: 100%;
  height: auto;
}
</style>
