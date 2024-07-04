<template>
  <q-page class="flex flex-center">
    <img alt="Logo Alcaldía" src="~assets/Logo v2.jpg" style="width: 330px; height: 420px" class="responsive-image">
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
    // const resp = checkAuthStatus()

    // resp.then((resp) => {
    //   if (resp.ok === false) {
    //     Swal.fire(
    //       'Error',
    //       'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
    //       'info',
    //     ).then((result) => {
    //       if (result.isConfirmed) {
    //         router.push({ name: 'login' })
    //         logout()
    //       } else {
    //         router.push({ name: 'login' })
    //         logout()
    //       }
    //     })
    //   }
    // })
  }
})
</script>

<style scoped>
.responsive-image {
  max-width: 100%;
}
</style>
