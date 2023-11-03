<template>
  <div class="q-pa-md">
    <!-- <span class="text-h5 row justify-center q-mt-xs">Estadísticas por Usuarios</span> -->
    <!-- <div class="row justify-center q-mt-xs">
      <ChartUsersDocs />
      <ChartUsersContracts />
    </div> -->
    <div class="row justify-center q-mt-xs">
      <apexchart type="pie" width="450" :options="chartOptionsContracts" :series="seriesContracts"></apexchart>
      <apexchart type="pie" width="450" :options="chartOptionsDocs" :series="seriesDocs"></apexchart>
    </div>
    <q-table class="my-sticky-virtscroll-table q-mt-xs" virtual-scroll flat bordered title="Estadísticas por Usuarios"
      :rows="sortedData" :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="id"
      v-model:pagination.sync="pagination" :rows-per-page-options="[10, 20, 30, 50]"
      :rows-per-page-label="'Registros por página'" :filter="filter" :no-data-label="'No hay datos disponibles'"
      :no-results-label="'No se encontraron registros'">
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
          <div>Filtrar</div>
          <q-icon right size="2em" name="event" />
          <q-popup-proxy transition-show="scale" transition-hide="scale" @show="show" @hide="hide">
            <q-date v-model="dateFilter" :locale="myLocale" range>
              <div class="row items-center justify-end q-gutter-xs">
                <q-btn v-close-popup label="Limpiar" color="primary" @click="clearFilter" flat></q-btn>
                <q-btn v-close-popup label="Filtrar" color="primary" @click="filterData"></q-btn>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="fecha">{{ props.row.fecha }}</q-td>
          <q-td key="id">{{ props.row.usuario_id }}</q-td>
          <q-td key="usuario">{{ props.row.username }}</q-td>
          <q-td key="nombre">{{ props.row.name }}</q-td>
          <q-td key="contrato">{{ props.row.nro_contratos }}</q-td>
          <q-td key="documento">{{ props.row.nro_documentos }}</q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import { useQuasar } from 'quasar'
import ChartUsersDocs from 'src/modules/app/components/ChartUsersDocs.vue';
import ChartUsersContracts from 'src/modules/app/components/ChartUsersContracts.vue';
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';


export default defineComponent({
  name: 'Reports',
  components: {
    apexchart: VueApexCharts,
    // ChartUsersDocs,
    // ChartUsersContracts
  },
  setup() {
    const $q = useQuasar()

    const chartOptionsContracts = ref({})
    const seriesContracts = ref([])
    const chartOptionsDocs = ref({})
    const seriesDocs = ref([])
    const dataUsers = ref([])
    const usernames = ref([])

    const pagination = ref({})
    const filter = ref('')
    const data = ref([])
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


    const columns = [
      { name: 'fecha', align: 'left', label: 'FECHA', field: 'fecha', sortable: true },
      { name: 'id', align: 'left', label: 'ID USUARIO', field: 'usuario_id', sortable: true },
      { name: 'usuario', align: 'left', label: 'USUARIO', field: 'username' },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: 'name' },
      { name: 'contratos', align: 'left', label: 'NÚMERO DE CONTRATOS', field: 'nro_contratos', sortable: true },
      { name: 'documentos', align: 'left', label: 'NÚMERO DE DOCUMENTOS', field: 'nro_documentos', sortable: true },
    ]

    const getData = async () => {
      await api.get('/reportes/')
        .then(result => {
          data.value = result.data;
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
      let seriesData = data.value
      const nroContratosPorUsuario = [];
      const nroDocsPorUsuario = [];
      seriesData.forEach(item => {
        const { username, nro_contratos } = item;
        if (nroContratosPorUsuario[username] === undefined) {
          nroContratosPorUsuario[username] = nro_contratos;
        } else {
          nroContratosPorUsuario[username] += nro_contratos;
        }
      });
      seriesData.forEach(item => {
        const { username, nro_documentos } = item;
        if (nroDocsPorUsuario[username] === undefined) {
          nroDocsPorUsuario[username] = nro_documentos;
        } else {
          nroDocsPorUsuario[username] += nro_documentos;
        }
      });
      seriesContracts.value = Object.values(nroContratosPorUsuario)
      seriesDocs.value = Object.values(nroDocsPorUsuario)
      let names = data.value.map(e => e.username)
      usernames.value = [...new Set(names)]
      chartOptionsContracts.value = {
        chart: {
          width: 450,
          type: 'pie',
        },
        labels: usernames.value,
        title: {
          text: 'Contratos digitalizados',
          align: 'center',
          offsetY: -3,
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 400
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      }
      chartOptionsDocs.value = {
        chart: {
          width: 450,
          type: 'pie',
        },
        labels: usernames.value,
        title: {
          text: 'Documentos digitalizados',
          align: 'center',
          offsetY: -3,
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 400
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      }
    }

    const getDataByDate = async (numElements) => {
      if (numElements == 2) {
        await api.get(`/reportes/?fromDate=${from.value}&toDate=${to.value}`)
          .then(result => {
            data.value = result.data;
            if (data.value.length === 0) {
              Swal.fire(
                {
                  html: 'No se encontraron registros.<br>Seleccione una fecha o un rango de fechas.',
                  icon: 'info'
                }
              ).then((result) => {
                if (result.isConfirmed) {
                  clearFilter()
                } else {
                  clearFilter()
                }
              })
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
        let seriesData = data.value
        const nroContratosPorUsuario = [];
        const nroDocsPorUsuario = [];
        seriesData.forEach(item => {
          const { username, nro_contratos } = item;
          if (nroContratosPorUsuario[username] === undefined) {
            nroContratosPorUsuario[username] = nro_contratos;
          } else {
            nroContratosPorUsuario[username] += nro_contratos;
          }
        });
        seriesData.forEach(item => {
          const { username, nro_documentos } = item;
          if (nroDocsPorUsuario[username] === undefined) {
            nroDocsPorUsuario[username] = nro_documentos;
          } else {
            nroDocsPorUsuario[username] += nro_documentos;
          }
        });
        seriesContracts.value = Object.values(nroContratosPorUsuario)
        seriesDocs.value = Object.values(nroDocsPorUsuario)
        let names = data.value.map(e => e.username)
        usernames.value = [...new Set(names)]
        chartOptionsContracts.value = {
          chart: {
            width: 450,
            type: 'pie',
          },
          labels: usernames.value,
          title: {
            text: 'Contratos digitalizados',
            align: 'center',
            offsetY: -3,
          },
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 400
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        }
        chartOptionsDocs.value = {
          chart: {
            width: 450,
            type: 'pie',
          },
          labels: usernames.value,
          title: {
            text: 'Documentos digitalizados',
            align: 'center',
            offsetY: -3,
          },
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 400
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        }
      } else {
        await api.get(`/reportes/?fromDate=${dateFilter.value}&toDate=${dateFilter.value}`)
          .then(result => {
            data.value = result.data;
            if (data.value.length === 0) {
              Swal.fire(
                {
                  html: 'No se encontraron registros.<br>Seleccione una fecha o un rango de fechas.',
                  icon: 'info'
                }
              ).then((result) => {
                if (result.isConfirmed) {
                  clearFilter()
                } else {
                  clearFilter()
                }
              })
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
        let seriesData = data.value
        const nroContratosPorUsuario = [];
        const nroDocsPorUsuario = [];
        seriesData.forEach(item => {
          const { username, nro_contratos } = item;
          if (nroContratosPorUsuario[username] === undefined) {
            nroContratosPorUsuario[username] = nro_contratos;
          } else {
            nroContratosPorUsuario[username] += nro_contratos;
          }
        });
        seriesData.forEach(item => {
          const { username, nro_documentos } = item;
          if (nroDocsPorUsuario[username] === undefined) {
            nroDocsPorUsuario[username] = nro_documentos;
          } else {
            nroDocsPorUsuario[username] += nro_documentos;
          }
        });
        seriesContracts.value = Object.values(nroContratosPorUsuario)
        seriesDocs.value = Object.values(nroDocsPorUsuario)
        let names = data.value.map(e => e.username)
        usernames.value = [...new Set(names)]
        chartOptionsContracts.value = {
          chart: {
            width: 450,
            type: 'pie',
          },
          labels: usernames.value,
          title: {
            text: 'Contratos digitalizados',
            align: 'center',
            offsetY: -3,
          },
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 400
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        }
        chartOptionsDocs.value = {
          chart: {
            width: 450,
            type: 'pie',
          },
          labels: usernames.value,
          title: {
            text: 'Documentos digitalizados',
            align: 'center',
            offsetY: -3,
          },
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 400
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        }
      }

    }

    const sortedData = computed(() => {
      return [...data.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    })

    const filterData = async () => {
      if (dateFilter.value.to > today.value) {
        Swal.fire(
          {
            html: 'La fecha seleccionada supera la fecha actual.',
            icon: 'info'
          }
        )
        clearFilter()
        return
      } else {
        const numElements = Object.keys(dateFilter.value).length
        from.value = ''
        to.value = ''
        oneDay.value = ''
        try {
          if (!numElements == 0) {
            const fromDate = dateFilter.value.from.replace(/\//g, '-')
            from.value = fromDate
            const toDate = dateFilter.value.to.replace(/\//g, '-')
            to.value = toDate
            getDataByDate(numElements)
          } else {
            Swal.fire(
              {
                html: 'Seleccione una fecha o un rango de fechas.',
                icon: 'info'
              }
            )
            return
          }
        } catch (e) {
          oneDay.value = dateFilter.value
          if (oneDay.value > today.value) {
            Swal.fire(
              {
                html: 'La fecha seleccionada supera la fecha actual.',
                icon: 'info'
              }
            )
            clearFilter()
            return
          } else {
            oneDay.value = dateFilter.value.replace(/\//g, '-')
            getDataByDate(numElements)
          }
        }
      }
    }

    const show = () => {
      dateFilter.value = today.value
    }

    const hide = () => {
      dateFilter.value = today.value
    }

    const clearFilter = async () => {
      from.value = ''
      to.value = ''
      oneDay.value = ''
      dateFilter.value = {}
      getData()
    }

    onMounted(async () => {
      $q.loading.show({
        message: 'Cargando...'
      })
      await getData()
      $q.loading.hide()
    })

    watch(from, (newFrom) => {
      if (newFrom) {
      }
    })

    return {
      pagination,
      filter,
      columns,
      sortedData,
      dateFilter,
      dateClosePopup,
      filterData,
      clearFilter,
      from,
      to,
      oneDay,
      today,
      show,
      hide,

      seriesContracts,
      chartOptionsContracts,
      seriesDocs,
      chartOptionsDocs,

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
  }
})
</script>

<style scoped lang="sass">
.my-sticky-virtscroll-table
  /* height or max-height is important */
  height: 500px

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
