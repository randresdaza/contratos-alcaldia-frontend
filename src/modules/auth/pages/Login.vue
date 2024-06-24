<template>
  <q-page>
    <q-card class="q-gutter-xs fixed-center" style="width: 350px; height: 390px; max-width: 80vw; max-height: 200vw;">
      <q-card-section class="col-xs-12 col-sm-12 col-md-4">
        <div class="text-h5 text-center q-mb-md">Iniciar Sesión</div>

        <q-separator spaced />

        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-xs col-xs-12 col-sm-12 col-md-4 q-pt-md">

          <q-input filled v-model="userForm.username" label="Nombre de Usuario" type="text" lazy-rules
            :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />

          <q-input filled type="password" v-model="userForm.password" label="Contraseña" lazy-rules
            :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />

          <q-separator spaced />

          <q-checkbox name="checkbox" class="row justify-center" v-model="userForm.conditions"
            :style="userForm.errorInConditions && !userForm.conditions && 'color:red'"
            label="Acepto las condiciones y términos de uso" />

          <div class="row justify-center q-mb-xs q-mt-md">
            <q-btn push unelevated label="Ingresar" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';
import { useQuasar } from 'quasar'
import Swal from 'sweetalert2';

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()
    const { loginUser } = useAuth()
    const $q = useQuasar()

    const userForm = ref({
      username: '',
      password: '',
      conditions: false,
      errorInConditions: false
    })

    return {
      userForm,

      onSubmit: async () => {
        userForm.value.errorInConditions = false
        if (!userForm.value.conditions) {
          $q.notify({
            message: 'Debe aceptar los terminos y condiciones.',
            icon: 'las la-exclamation-circle'
          })
          userForm.value.errorInConditions = true
          return
        }
        const { ok, message } = await loginUser(userForm.value)
        if (!ok) {
          Swal.fire('Error', message, 'error')
        }
        else {
          Swal.fire('¡Bienvenido al sistema!', message, 'success')
          router.push({ name: 'home' })
        }
      },
      onReset() {
        userForm.value = {
          username: '',
          password: '',
          conditions: false,
          errorInConditions: false
        }
      },
    }
  }
})
</script>
