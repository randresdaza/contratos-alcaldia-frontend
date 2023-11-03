<template>
  <div class="q-pa-lg">
    <q-table class="my-sticky-virtscroll-table" virtual-scroll flat bordered title="Documentos" :rows="sortedData"
      :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="id" v-model:pagination.sync="pagination"
      :rows-per-page-options="[5, 10, 30, 50]" :rows-per-page-label="'Registros por página'" :filter="filter"
      :no-data-label="'No hay datos disponibles'" :no-results-label="'No se encontraron registros'">
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id">{{ props.row.id }}</q-td>
          <q-td key="nombre">{{ props.row.nombre }}</q-td>
          <q-td key="fecha_creacion">{{ props.row.fecha_creacion }}</q-td>
          <q-td key="nro_paginas">{{ props.row.nro_paginas }}</q-td>
          <q-td key="contrato_id">{{ props.row.contrato.id }}</q-td>
          <q-td key="contrato_asunto">{{ props.row.contrato.asunto }}</q-td>
          <q-td class="center" key="actions">
            <q-btn push class="q-mr-xs" icon="las la-file-pdf" color="red-14" label="Ver PDF" stack glossy
              @click="onView(props.row)"></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-btn push class="q-mt-lg q-mb-md q-pt-md q-pb-md" color="standard" text-color="black" icon="las la-undo"
      label="Regresar" @click="onBack" />
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';
import uploadFile from 'src/modules/app/helpers/uploadFile';
import moment from 'moment-timezone';
import CryptoJS from 'crypto-js';


export default {
  props: ['id'],
  setup(props) {
    const $q = useQuasar()
    const router = useRouter()

    const { username } = useAuth()

    const pagination = ref({})
    const filter = ref('')

    const data = ref([])
    const dataUser = ref([])

    const modalDoc = ref(false)

    const file = ref(null)
    const fileSize = ref(Number)

    const nDocs = ref('')

    const isDocValid = ref(Boolean)

    const contractId = ref(props.id)

    const columns = [
      { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: 'nombre' },
      { name: 'fecha_creacion', align: 'left', label: 'FECHA CREACIÓN', field: 'fecha_creacion', sortable: true },
      { name: 'nro_paginas', align: 'left', label: 'NÚMERO DE PÁGINAS', field: 'nro_paginas', sortable: true },
      { name: 'contrato_id', align: 'left', label: 'ID CONTRATO', field: row => row.contrato.id },
      { name: 'contrato_asunto', align: 'left', label: 'ASUNTO CONTRATO', field: row => row.contrato.asunto },
      { name: 'actions', align: 'center', label: 'ACCIONES' }
    ]

    const getDataDocs = async () => {
      await api.get(`/documentos/contrato/${props.id}/`)
        .then(result => {
          data.value = result.data;
          for (let i = 0; i < data.value.length; i++) {
            let fecha = new Date(data.value[i].fecha_creacion);
            fecha.setHours(fecha.getHours());

            // Formatear la fecha a tu formato deseado
            let año = fecha.getFullYear();
            let mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            let dia = fecha.getDate().toString().padStart(2, '0');
            let hora = fecha.getHours().toString().padStart(2, '0');
            let minuto = fecha.getMinutes().toString().padStart(2, '0');
            let segundo = fecha.getSeconds().toString().padStart(2, '0');

            // Crear la cadena de fecha en tu formato deseado
            let dateFormat = `${año}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;

            data.value[i].fecha_creacion = dateFormat;
          }
        })
        .catch(e => {
          console.log(e);
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

    const getDataUser = async () => {
      await api.get(`/users/username/${username.value}/`)
        .then(result => {
          dataUser.value = result.data;
        })
        .catch(e => {
          console.log(e)
        })
    }

    const getDataContract = async (data) => {
      await api.get(`/contratos/${data.id}/`)
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

    const onNew = () => {
      router.push({ name: 'new-contract' })
    }

    const onBack = () => {
      router.push({ name: 'contracts' })
    }

    const onView = (data) => {
      const claveSecreta = 'yEoKdfOAnPsMeU7YorhFGSbliDMclou8'
      const fileEncriptado = CryptoJS.AES.encrypt(data.file, claveSecreta).toString()
      router.push({ name: 'view-doc', params: { idDoc: data.id, file: fileEncriptado } })
    }

    const onAddDocument = (data) => {
      getDataUser()
      getDataContract(data)
      modalDoc.value = true
    }

    const updateContract = async () => {
      console.log('NDOCS', nDocs.value);
      const contractToSave = {
        asunto: formData.value.asunto,
        fecha_inicial: formData.value.fecha_inicial,
        fecha_final: formData.value.fecha_final,
        estante: formData.value.estante,
        bandeja: formData.value.bandeja,
        caja: formData.value.caja,
        nro_orden: formData.value.nro_orden,
        nro_folios: nDocs.value,
        observaciones: formData.value.observaciones,
        dependencia: formData.value.dependencia.id,
        serie: formData.value.serie.id,
        subserie: formData.value.subserie.id,
      }
      console.log("Data to save UPDATE CONTRACT", contractToSave);
      await api.put(`/contratos/${formData.value.id}/`, contractToSave)
        .then(result => {
          getData()
        })
        .catch(e => {
          modalDoc.value = false
          Swal.fire(
            'Error',
            'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
            'error',
          )
          console.log(e)
        })
    }

    const getNDocs = async () => {
      await api.get(`/documentos/contrato/${formData.value.id}/`)
        .then(result => {
          const data = result.data
          nDocs.value = data.length
          console.log('NDOCS ANTES UPDATE', nDocs.value);
          updateContract()
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

    const validateDocSize = async () => {
      let size = 0;
      for (let i = 0; i < file.value.length; i++) {
        if (file.value[i].size <= 1100000) {
          isDocValid.value = true
          size += file.value[i].size
        } else {
          modalDoc.value = false
          isDocValid.value = false
          Swal.fire(
            {
              icon: 'error',
              title: 'Error',
              html: `El archivo ${file.value[i].name} supera el tamaño máximo permitido (1 MB).<br><br>Tamaño: ${(file.value[i].size / 1048576).toFixed(2)} MB`,
            }
          )
          break
        }
      }
      fileSize.value = (size / 1048576).toFixed(2)
    }

    const addDocument = async () => {
      let exist = false
      $q.loading.show({
        message: 'Subiendo archivos. Por favor espere...',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'primary'
      })
      const resp = await uploadFile(file.value)
      console.log(resp);
      for (let i = 0; i < resp.length; i++) {
        let fullDate = resp[i].created_at
        let dateFormat = moment.tz(fullDate, 'YYYY-MM-DDTHH:mm:ss[Z]', 'UTC')
        let date = dateFormat.format('YYYY-MM-DD HH:mm:ss')
        if (!resp[i].existing) {
          let name = file.value[i].name.split('.')[0]
          let dataToSave = {
            nombre: name,
            fecha_creacion: date,
            nro_paginas: resp[i].pages,
            file: resp[i].secure_url,
            contrato: formData.value.id,
            usuario: dataUser.value.id
          }
          console.log('Data to Save: ', dataToSave);
          await api.post('/documentos/', dataToSave)
            .then(result => {
              console.log('Guardado: ', i);
            })
            .catch(e => {
              modalDoc.value = false
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
              console.log(e)
            })
        } else {
          exist = true
        }
      }
      getNDocs()
      $q.loading.hide()
      modalDoc.value = false
      if (exist) {
        Swal.fire({
          icon: 'info',
          html: 'Algunos archivos ya existen.'
        })
      } else {
        Swal.fire('Guardado', 'Registrado con éxito.', 'success')
      }
    }

    const onReset = () => {
      file.value = null
    }

    const sortedData = computed(() => {
      return [...data.value].sort((a, b) => b.id - a.id)
    })

    watch(modalDoc, (newValue) => {
      if (!newValue) {
        onReset()
      }
    })

    watch(file, (newValue) => {
      if (newValue) {
        validateDocSize()
      }
    })

    onMounted(() => {
      getDataDocs()
    })

    return {
      sortedData,
      pagination,
      filter,
      columns,

      data,
      modalDoc,

      onNew,
      onView,
      onBack,
      onAddDocument,
      validateDocSize,

      file,
      fileSize,

      addDocument,

      onReset,
    }
  }
}
</script>


<style lang="sass" scoped>
.center
  text-align: center

.my-sticky-virtscroll-table
  /* height or max-height is important */
  height: 535px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #ffffff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
