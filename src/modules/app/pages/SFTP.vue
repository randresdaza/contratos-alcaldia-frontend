<template>
  <div class="q-pa-lg q-mt-md">
    <div class="row justify-center">
      <q-card class="my-card col-xs-12 col-sm-10 col-md-10 col-lg-11">
        <q-card-section>
          <div class="text-h5 row justify-center">Servidor SFTP</div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <q-form @submit="validateRoute">
            <div class="row justify-center items-center">
              <span class="text-h6 q-mb-xs">Ruta de los archivos:</span>
              <q-input outlined v-if="input" v-model="route"
                class="q-ml-md q-mt-md q-pb-md col-xs-6 col-sm-6 col-md-6 col-lg-6" :dense=true
                hint='Ejemplo: /home/usuario/carpeta destino (tener en cuenta mayúsculas y minúsculas)' lazy-rules
                :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />
              <q-field outlined v-if="field" class="q-ml-md q-mt-md q-pb-md col-xs-6 col-sm-6 col-md-6 col-lg-6"
                :dense=true>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">{{ route }}</div>
                </template>
              </q-field>
            </div>
            <div class="row justify-center items-center q-mt-md">
              <q-btn push class="q-ml-md q-mt-md q-mb-md q-pt-md q-pb-md" color="lime-6"
                icon-right="las la-check-circle" label="Validar Ruta" type="submit" />
              <q-btn push class="q-ml-md q-mt-md q-mb-md q-pt-md q-pb-md" color="blue-5" icon-right="las la-broom"
                label="Limpiar" @click="clean" />
              <q-btn :disable="valid" push class="q-ml-md q-mt-md q-mb-md q-pt-md q-pb-md" color="secondary"
                icon-right="las la-save" label="Guardar" @click="saveRoute" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';


export default {
  setup() {
    const router = useRouter()
    const { logout } = useAuth()
    // const initRoute = ref('/home/')
    const data = ref([])
    const initRoute = ref('')
    const route = ref('')
    const newRoute = ref({
      id: '',
      ruta: ''
    })
    const valid = ref(true)
    const input = ref(true)
    const field = ref(false)

    const getRoute = async () => {
      await api.get('/route/')
        .then(result => {
          data.value = result.data;
          route.value = data.value[0].ruta
        })
        .catch(async (e) => {
          if (e.response.status == 401) {
            await logout()
            Swal.fire(
              {
                html: 'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
                icon: 'info'
              }
            ).then((result) => {
              if (result.isConfirmed) {
                router.push({ name: 'login' })
              } else {
                router.push({ name: 'login' })
              }
            })
          }
        })
    }

    const validateRoute = async () => {
      await api.get('/files/', {
        params: {
          route: route.value
        }
      })
        .then(result => {
          if (result.status == 200) {
            Swal.fire(
              {
                html: `${result.data.detail}`,
                icon: 'success'
              }
            )
            // route.value = initRoute.value
            valid.value = false
            input.value = false
            field.value = true
          } else if (result.status == 202) {
            Swal.fire(
              {
                html: `${result.data.detail}`,
                icon: 'info'
              }
            )
            valid.value = true
          }
        })
        .catch(async (e) => {
          if (e.response.status == 401) {
            await logout()
            Swal.fire(
              {
                html: 'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
                icon: 'info'
              }
            ).then((result) => {
              if (result.isConfirmed) {
                router.push({ name: 'login' })
              } else {
                router.push({ name: 'login' })
              }
            })
          }
        })
    }

    const saveRoute = async () => {
      newRoute.value = {
        id: data.value[0].id,
        ruta: route.value
      }
      await api.put(`/route/${newRoute.value.id}/`, newRoute.value)
        .then(result => {
          Swal.fire('Guardado', 'Registrado con éxito.', 'success')
          valid.value = true
          input.value = true
          field.value = false
        })
        .catch(async (e) => {
          if (e.response.status == 401) {
            await logout()
            Swal.fire(
              {
                html: 'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
                icon: 'info'
              }
            ).then((result) => {
              if (result.isConfirmed) {
                router.push({ name: 'login' })
              } else {
                router.push({ name: 'login' })
              }
            })
          }
        })
    }

    const clean = () => {
      route.value = ''
      valid.value = true
      input.value = true
      field.value = false
    }

    onMounted(() => {
      getRoute()
    })

    return {
      initRoute,
      route,
      valid,
      input,
      field,
      data,
      validateRoute,
      saveRoute,
      clean
    }
  }
}
</script>
