<template>
  <div class="q-pa-md">
    <q-table class="my-sticky-header-table-audit" flat bordered title="Históricos por Usuario" :rows="data"
      :columns="columns" row-key="id" v-model:pagination.sync="pagination" :rows-per-page-options="[10, 20, 30, 50]"
      :rows-per-page-label="'Registros por página'" :filter="filter" :no-data-label="'No hay datos disponibles'"
      :no-results-label="'No se encontraron registros'" @request="onRequest">
      <template v-slot:top-right>
        <span v-if="from || to != '' || oneDay != ''">Mostrando registros</span>
        <div v-if="from || to != ''" class="q-mr-md q-ml-xs">
          desde: <b>{{ from }}</b>
          hasta: <b>{{ to }}</b>
        </div>
        <div v-if="oneDay != ''" class="q-mr-md q-ml-xs">
          del: <b>{{ oneDay }}</b>
        </div>
        <q-btn outline rounded color="primary" class="q-mr-md">
          <div>Filtrar por Fecha</div>
          <q-icon right size="2em" name="event" />
          <q-popup-proxy transition-show="scale" transition-hide="scale" @show="show" @hide="hide">
            <q-date today-btn v-model="dateFilter" :locale="myLocale" range>
              <div class="row items-center justify-end q-gutter-xs">
                <q-btn v-close-popup label="Limpiar" color="primary" @click="clearFilterDate" flat></q-btn>
                <q-btn v-close-popup label="Filtrar" color="primary" @click="filterDataByDate"></q-btn>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
        <div>
          <span class="text-subtitle2 q-mr-md">Filtrar por usuario:</span>
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
          <q-td key="id">{{ props.row.id }}</q-td>
          <q-td key="evento_sobre">{{ props.row.evento_sobre }}</q-td>
          <q-td key="fecha">{{ props.row.fecha }}</q-td>
          <q-td key="accion">{{ props.row.accion }}</q-td>
          <q-td key="usuario">{{ props.row.usuario.username }}</q-td>
          <q-td key="nombre">{{ props.row.usuario.name }}</q-td>
          <q-td key="contrato">{{ props.row.contrato.asunto }}</q-td>
          <q-td key="documento">{{ props.row.documento.nombre }}</q-td>
          <!-- <q-td key="contrato_documento">{{ props.row.documento.contrato.asunto }}</q-td> -->
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios';
import useAuth from 'src/modules/auth/composables/useAuth';
import Swal from 'sweetalert2';

export default {
  setup() {
    const pagination = ref({})
    const filter = ref('')
    const data = ref([])
    const { logout } = useAuth()

    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const dayFormat = day.toString().padStart(2, '0')
    const monthFormat = month.toString().padStart(2, '0')
    const fromDate = `${year}/${monthFormat}/${dayFormat}`
    const toDate = `${year}/${monthFormat}/${dayFormat}`
    const dateFilter = ref({ from: fromDate, to: toDate })
    const from = ref('')
    const to = ref('')
    const oneDay = ref('')
    const today = ref(fromDate)
    const dateClosePopup = ref(Boolean)
    const numberDates = ref(2)

    const filterInputRef = ref(null)

    const columns = [
      { name: 'id', align: 'left', label: 'ID', field: 'id' },
      { name: 'evento_sobre', align: 'left', label: 'TABLA AFECTADA', field: 'evento_sobre' },
      { name: 'fecha', align: 'left', label: 'FECHA', field: 'fecha' },
      { name: 'accion', align: 'left', label: 'ACCIÓN', field: 'accion' },
      { name: 'usuario', align: 'left', label: 'USUARIO', field: row => row.usuario.username },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: row => row.usuario.name },
      { name: 'contrato', align: 'left', label: 'CONTRATO', field: row => row.contrato.asunto },
      { name: 'documento', align: 'left', label: 'DOCUMENTO', field: row => row.documento.nombre },
      // { name: 'contrato_documento', align: 'left', label: 'CONTRATO ASOCIADO', field: row => row.documento.contrato.asunto },
    ]

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      getDataByDate(filter)
    }

    const getDataByDate = async (filter) => {
      if (numberDates.value == 2) {
        await api.get(`/historicos/?filter=${filter}&page=${pagination.value.page}&page_size=${pagination.value.rowsPerPage}&fromDate=${from.value}&toDate=${to.value}`)
          .then(result => {
            data.value = result.data.results;
            pagination.value.rowsNumber = result.data.count;
            for (let i = 0; i < data.value.length; i++) {
              let fecha = new Date(data.value[i].fecha);
              fecha.setHours(fecha.getHours());
              let año = fecha.getFullYear();
              let mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
              let dia = fecha.getDate().toString().padStart(2, '0');
              let hora = fecha.getHours().toString().padStart(2, '0');
              let minuto = fecha.getMinutes().toString().padStart(2, '0');
              let segundo = fecha.getSeconds().toString().padStart(2, '0');
              let dateFormat = `${año}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
              data.value[i].fecha = dateFormat;
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
                  logout()
                } else {
                  router.push({ name: 'login' })
                  logout()
                }
              })
            }
          })
      } else {
        dateFilter.value = dateFilter.value.replace(/\//g, '-')
        await api.get(`/historicos/?filter=${filter}&page=${pagination.value.page}&page_size=${pagination.value.rowsPerPage}&fromDate=${dateFilter.value}&toDate=${dateFilter.value}`)
          .then(result => {
            data.value = result.data.results;
            pagination.value.rowsNumber = result.data.count;
            for (let i = 0; i < data.value.length; i++) {
              let fecha = new Date(data.value[i].fecha);
              fecha.setHours(fecha.getHours());
              let año = fecha.getFullYear();
              let mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
              let dia = fecha.getDate().toString().padStart(2, '0');
              let hora = fecha.getHours().toString().padStart(2, '0');
              let minuto = fecha.getMinutes().toString().padStart(2, '0');
              let segundo = fecha.getSeconds().toString().padStart(2, '0');
              let dateFormat = `${año}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
              data.value[i].fecha = dateFormat;
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
                  logout()
                } else {
                  router.push({ name: 'login' })
                  logout()
                }
              })
            }
          })
      }
    }

    const filterDataByDate = async () => {
      try {
        if (dateFilter.value.to > today.value) {
          Swal.fire(
            {
              icon: 'info',
              html: 'La fecha seleccionada supera la fecha actual.',
            }
          )
          return clearFilter()
        } else {
          numberDates.value = Object.keys(dateFilter.value).length
          from.value = ''
          to.value = ''
          oneDay.value = ''
          try {
            if (numberDates.value) {
              const fromDate = dateFilter.value.from.replace(/\//g, '-')
              from.value = fromDate
              const toDate = dateFilter.value.to.replace(/\//g, '-')
              to.value = toDate
              getDataByDate(filter.value)
            }
          } catch (e) {
            oneDay.value = dateFilter.value
            if (oneDay.value > today.value) {
              Swal.fire(
                {
                  icon: 'info',
                  html: 'La fecha seleccionada supera la fecha actual.',
                }
              )
              return clearFilter()
            } else {
              oneDay.value = dateFilter.value.replace(/\//g, '-')
              dateFilter.value = dateFilter.value.replace(/\//g, '-')
              getDataByDate(filter.value)
            }
          }
        }
      } catch (e) {
        Swal.fire(
          {
            html: 'Seleccione una fecha o un rango de fechas.',
            icon: 'error'
          }
        )
      }
    }

    const show = () => {
      // dateFilter.value = today.value
    }

    const hide = () => {

    }

    const clearFilterDate = async () => {
      from.value = ''
      to.value = ''
      oneDay.value = ''
      dateFilter.value = {}
      numberDates.value = 2
      getDataByDate(filter.value)
    }

    const clearFilter = async () => {
      filter.value = ''
      filterInputRef.value.focus()
    }

    onMounted(() => {
      getDataByDate(filter.value)
    })

    return {
      pagination,
      filter,
      columns,
      data,
      onRequest,

      dateFilter,
      dateClosePopup,
      filterDataByDate,
      clearFilterDate,
      clearFilter,
      from,
      to,
      oneDay,
      today,
      show,
      hide,

      filterInputRef,

      myLocale: {
        /* starting with Sunday */
        days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
        daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
        firstDayOfWeek: 0, // 0-6, 0 - Sunday, 1 Monday, ...
        format24h: true,
        pluralDay: 'días'
      }
    }
  },
}
</script>

<style lang="sass">
.my-sticky-header-table-audit
  /* height or max-height is important */
  height: 625px

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
