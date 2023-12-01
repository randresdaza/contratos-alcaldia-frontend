<template>
  <q-page class="q-pa-md">
    <span class="text-h5 row justify-center q-mt-xs">Información del Contrato</span>
    <div>
      <q-form @submit="edit ? updateData() : addData()" @reset="onReset" class="q-gutter-md q-mt-lg">
        <div class="row justify-center">
          <q-input class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.asunto" label="Asunto"
            type="text" lazy-rules :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />
          <q-select class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.dependencia"
            :options="dependencies" label="Dependencia" option-label="nombre"
            :rules="[val => !!val || 'Este campo es obligatorio']" />
        </div>

        <div class="row justify-center">
          <q-select class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.serie" :options="series"
            label="Serie" option-label="nombre" :rules="[val => !!val || 'Este campo es obligatorio']" />
          <q-select class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.subserie"
            :options="subseries" label="Subserie" option-label="nombre"
            :rules="[val => !!val || 'Este campo es obligatorio']" />
        </div>

        <div class="row justify-center">
          <q-input class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" @click="dateClosePopup = false"
            label="Fecha Inicial" filled v-model="formData.fecha_inicial" input-class="cursor-pointer" mask="####-##-##"
            lazy-rules :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-date v-close-popup="dateClosePopup" @input="dateClosePopup = true"
                @update:model-value="dateClosePopup = true" @navigation="dateClosePopup = false"
                v-model="formData.fecha_inicial" mask="YYYY-MM-DD" :locale="myLocale" today-btn>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat></q-btn>
                </div>
              </q-date>
            </q-popup-proxy>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer"></q-icon>
            </template>
          </q-input>

          <q-input class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" @click="dateClosePopup = false"
            label="Fecha Final" filled v-model="formData.fecha_final" input-class="cursor-pointer" mask="####-##-##"
            lazy-rules :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-date v-close-popup="dateClosePopup" @input="dateClosePopup = true"
                @update:model-value="dateClosePopup = true" @navigation="dateClosePopup = false"
                v-model="formData.fecha_final" mask="YYYY-MM-DD" :locale="myLocale" today-btn>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat></q-btn>
                </div>
              </q-date>
            </q-popup-proxy>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer"></q-icon>
            </template>
          </q-input>
        </div>

        <div class="row justify-center">
          <q-input class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.estante" label="Estante"
            type="number" lazy-rules
            :rules="[val => val.length > 0 || 'Este campo es obligatorio', val => val > 0 || 'Debe ser mayor que cero']" />
          <q-input class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.bandeja" label="Bandeja"
            type="number" lazy-rules
            :rules="[val => val.length > 0 || 'Este campo es obligatorio', val => val > 0 || 'Debe ser mayor que cero']" />
        </div>

        <div class="row justify-center">
          <q-input class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.caja" label="Caja"
            type="number" lazy-rules
            :rules="[val => val.length > 0 || 'Este campo es obligatorio', val => val > 0 || 'Debe ser mayor que cero']" />
          <q-input class="col-xs-12 col-sm-10 col-md-4 q-ml-md q-mr-md" filled v-model="formData.nro_orden"
            label="Número de Orden" type="number"
            :rules="[val => val.length > 0 || 'Este campo es obligatorio', val => val > 0 || 'Debe ser mayor que cero']" />
        </div>

        <div class="row justify-center">
          <q-input class="row justify-center col-xs-12 col-sm-10 col-md-5" filled v-model="formData.observaciones"
            label="Observaciones" type="textarea" />
        </div>

        <div class="row justify-center q-mt-lg">
          <q-btn push icon-right="las la-broom" type="reset" color="blue" class="q-ml-sm q-mb-xs" />
        </div>

        <div class="row justify-center q-mt-md">
          <q-btn push class="q-ma-xs q-mr-xl" type="reset" @click="onCancel" icon="las la-times" color="white"
            text-color="black" label="Cancelar" stack glossy></q-btn>
          <q-btn push class="q-ma-xs q-ml-xl" type="submit" icon="las la-save" color="green" label="Guardar" stack
            glossy></q-btn>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios';
import Swal from 'sweetalert2';
import useAuth from 'src/modules/auth/composables/useAuth';


export default {
  props: ['id'],
  setup(props) {
    const { username } = useAuth()
    const router = useRouter()
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const dayFormat = day.toString().padStart(2, '0')
    const monthFormat = month.toString().padStart(2, '0')
    const fullDate = `${year}-${monthFormat}-${dayFormat}`
    const dateClosePopup = ref(Boolean)
    const dependencies = ref([])
    const series = ref([])
    const subseries = ref([])
    const edit = ref(false)
    const dataUser = ref([])

    const formData = ref({
      id: '',
      asunto: '',
      fecha_inicial: fullDate,
      fecha_final: fullDate,
      estante: '',
      bandeja: '',
      caja: '',
      nro_orden: '',
      nro_folios: '',
      observaciones: '',
      dependencia: '',
      serie: '',
      subserie: '',
      usuario: ''
    })

    const getDataUser = async () => {
      await api.get(`/users/username/${username.value}/`)
        .then(result => {
          dataUser.value = result.data;
        })
        .catch(e => {
          console.log(e)
        })
    }

    const getDataToEdit = async () => {
      if (edit.value) {
        await api.get(`/contratos/${props.id}/`)
          .then(result => {
            formData.value = result.data;
          })
          .catch(e => {
            if (e.response.status == 401) {
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
    }

    const addData = async () => {
      const dataToSave = {
        asunto: formData.value.asunto,
        fecha_inicial: formData.value.fecha_inicial,
        fecha_final: formData.value.fecha_final,
        estante: formData.value.estante,
        bandeja: formData.value.bandeja,
        caja: formData.value.caja,
        nro_orden: formData.value.nro_orden,
        observaciones: formData.value.observaciones,
        dependencia: formData.value.dependencia.id,
        serie: formData.value.serie.id,
        subserie: formData.value.subserie.id,
        usuario: dataUser.value.id
      }
      console.log('Data to save:', dataToSave);
      await api.post('/contratos/', dataToSave)
        .then(result => {
          Swal.fire({
            title: 'Registro guardado con éxito',
            text: "¿Desea realizar otro registro?",
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: 'green',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            reverseButtons: true
          }).then((result) => {
            if (result.isDismissed) {
              router.push({ name: 'contracts' })
            }
          })
        })
        .catch(e => {
          console.log(e)
          if (e.response.status == 400) {
            Swal.fire(
              {
                html: `Ya existe el contrato con asunto ${formData.value.asunto}.`,
                icon: 'info'
              }
            )
          } else if (e.response.status == 401) {
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

    const updateData = async () => {
      const dataToSave = {
        asunto: formData.value.asunto,
        fecha_inicial: formData.value.fecha_inicial,
        fecha_final: formData.value.fecha_final,
        estante: formData.value.estante,
        bandeja: formData.value.bandeja,
        caja: formData.value.caja,
        nro_orden: formData.value.nro_orden,
        nro_folios: formData.value.nro_folios,
        observaciones: formData.value.observaciones,
        dependencia: formData.value.dependencia.id,
        serie: formData.value.serie.id,
        subserie: formData.value.subserie.id,
        usuario: dataUser.value.id
      }
      console.log('Data to Update: ', dataToSave);
      await api.put(`/contratos/${props.id}/`, dataToSave)
        .then(result => {
          Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
            .then((result) => {
              if (result.isDismissed) {
                router.push({ name: 'contracts' })
              } else {
                router.push({ name: 'contracts' })
              }
            })
        })
        .catch(e => {
          if (e.response.status == 400) {
            Swal.fire(
              {
                html: `Ya existe el contrato con asunto ${formData.value.asunto}.`,
                icon: 'info'
              }
            )
          } else if (e.response.status == 401) {
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

    const onCancel = () => {
      router.push({ name: 'contracts' })
    }

    const getDependencies = async () => {
      await api.get('/dependencias/')
        .then(result => {
          dependencies.value = result.data
        })
        .catch(e => {
          if (e.response.status == 401) {
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

    const getSeries = async () => {
      await api.get('/series/')
        .then(result => {
          series.value = result.data
        })
        .catch(e => {
          // console.log(e)
        })
    }

    const getSubseries = async () => {
      await api.get('/subseries/')
        .then(result => {
          subseries.value = result.data
        })
        .catch(e => {
          // console.log(e)
        })
    }

    const validateEdit = () => {
      if (props.id) {
        edit.value = true
      }
    }


    const onReset = () => {
      formData.value = {
        id: '',
        asunto: '',
        fecha_inicial: fullDate,
        fecha_final: fullDate,
        estante: '',
        bandeja: '',
        caja: '',
        nro_orden: '',
        nro_folios: '',
        observaciones: '',
        dependencia: '',
        serie: '',
        subserie: '',
      }
    }


    onMounted(() => {
      validateEdit(),
        getDataUser(),
        getDataToEdit(),
        getDependencies(),
        getSeries(),
        getSubseries()
    })

    return {
      dateClosePopup,
      formData,
      dependencies,
      series,
      subseries,

      edit,

      addData,
      updateData,

      onCancel,
      onReset,

      myLocale: {
        /* starting with Sunday */
        days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
        daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
        firstDayOfWeek: 0, // 0-6, 0 - Sunday, 1 Monday, ...
        format24h: true,
        pluralDay: 'dias'
      }
    }
  },
}
</script>
