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
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';

export default {
  props: ['id'],
  setup(props) {
    const router = useRouter()
    const pagination = ref({})
    const filter = ref('')
    const data = ref([])

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

    const onBack = () => {
      router.push({ name: 'contracts' })
    }

    const onView = (data) => {
      const claveSecreta = 'yEoKdfOAnPsMeU7YorhFGSbliDMclou8'
      const fileEncriptado = CryptoJS.AES.encrypt(data.nombre + '.pdf', claveSecreta).toString()
      router.push({ name: 'view-doc', params: { idDoc: data.id, file: fileEncriptado } })
    }

    const sortedData = computed(() => {
      return [...data.value].sort((a, b) => b.id - a.id)
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

      onView,
      onBack,
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
