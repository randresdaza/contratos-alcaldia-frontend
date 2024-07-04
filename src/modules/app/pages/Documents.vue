<template>
  <div class="q-pa-lg">
    <q-table class="my-sticky-header-table-documents" virtual-scroll flat bordered title="Documentos" :rows="data"
      :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="id" v-model:pagination.sync="pagination"
      :rows-per-page-options="[10, 20, 30, 50]" :rows-per-page-label="'Registros por página'" :filter="filter"
      :no-data-label="'No hay datos disponibles'" :no-results-label="'No se encontraron registros'"
      @request="onRequest">
      <template v-slot:top-right>
        <div>
          <span class="text-subtitle2 q-mr-md">Filtrar por nombre:</span>
        </div>
        <q-input ref="filterInputRef" dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon v-if="!filter" name="search" />
            <q-icon v-if="filter" class="clickable-icon" name="cancel" @click="clearFilter" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <!-- <q-td key="id">{{ props.row.id }}</q-td> -->
          <q-td key="nombre">{{ props.row.nombre }}</q-td>
          <q-td key="fecha_creacion">{{ props.row.fecha_creacion }}</q-td>
          <q-td key="nro_paginas">{{ props.row.nro_paginas }}</q-td>
          <q-td key="contrato_id">{{ props.row.contrato.id }}</q-td>
          <q-td key="contrato_asunto">{{ props.row.contrato.asunto }}</q-td>
          <q-td class="center" key="actions">
            <q-btn push class="q-mr-xs" icon="picture_as_pdf" color="red-14" label="Ver PDF" stack glossy
              @click="onView(props.row)"></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-btn push class="q-mt-md q-pt-md q-pb-md" color="standard" text-color="black" icon="las la-undo" label="Regresar"
      @click="onBack" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';
import useAuth from 'src/modules/auth/composables/useAuth';

export default {
  props: ['id'],
  setup(props) {
    const router = useRouter()
    const pagination = ref({})
    const filter = ref('')
    const data = ref([])

    const filterInputRef = ref(null);


    const columns = [
      // { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: 'nombre' },
      { name: 'fecha_creacion', align: 'left', label: 'FECHA CREACIÓN', field: 'fecha_creacion', sortable: true },
      { name: 'nro_paginas', align: 'left', label: 'NÚMERO DE PÁGINAS', field: 'nro_paginas', sortable: true },
      { name: 'contrato_id', align: 'left', label: 'ID CONTRATO', field: row => row.contrato.id },
      { name: 'contrato_asunto', align: 'left', label: 'ASUNTO CONTRATO', field: row => row.contrato.asunto },
      { name: 'actions', align: 'center', label: 'ACCIONES' }
    ]

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      getDataDocs(filter)
    }

    const getDataDocs = async (filter) => {
      await api.get(`/documentos/contrato/${props.id}/?filter=${filter}&page=${pagination.value.page}&page_size=${pagination.value.rowsPerPage}`)
        .then(result => {
          data.value = result.data.results;
          pagination.value.rowsNumber = result.data.count;
          for (let i = 0; i < data.value.length; i++) {
            let fecha = new Date(data.value[i].fecha_creacion)
            fecha.setHours(fecha.getHours())

            let año = fecha.getFullYear()
            let mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
            let dia = fecha.getDate().toString().padStart(2, '0')
            let hora = fecha.getHours().toString().padStart(2, '0')
            let minuto = fecha.getMinutes().toString().padStart(2, '0')
            let segundo = fecha.getSeconds().toString().padStart(2, '0')
            let dateFormat = `${año}-${mes}-${dia} ${hora}:${minuto}:${segundo}`

            data.value[i].fecha_creacion = dateFormat
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

    const onBack = () => {
      router.push({ name: 'contracts' })
    }

    const onView = (data) => {
      const claveSecreta = 'yEoKdfOAnPsMeU7YorhFGSbliDMclou8'
      const fileEncriptado = CryptoJS.AES.encrypt(data.nombre + '.pdf', claveSecreta).toString()
      router.push({ name: 'view-doc', params: { idDoc: data.id, file: fileEncriptado } })
    }

    const clearFilter = () => {
      filter.value = ''
      filterInputRef.value.focus()
    }

    onMounted(() => {
      getDataDocs(filter.value)
    })

    return {
      pagination,
      filter,
      columns,
      data,

      onRequest,
      filterInputRef,
      clearFilter,

      onView,
      onBack,
    }
  }
}
</script>


<style lang="sass">
.center
  text-align: center

.my-sticky-header-table-documents
  /* height or max-height is important */
  height: 540px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #f5f5f5

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
