<template>
  <apexchart type="pie" width="450" :options="chartOptions" :series="series"></apexchart>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import VueApexCharts from "vue3-apexcharts";
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar'


export default defineComponent({
  name: 'ChartUsersDocs',
  components: { apexchart: VueApexCharts },
  setup() {
    const $q = useQuasar()
    const chartOptions = ref({})
    const series = ref([])
    const dataUsers = ref([])
    const usernames = ref([])

    const getUsers = async () => {
      await api.get(`/users/`)
        .then(result => {
          dataUsers.value = result.data
          usernames.value = dataUsers.value.map(e => e.username)
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

    const getNDocsByUser = async () => {
      for (let i = 0; i < dataUsers.value.length; i++) {
        await api.get(`/documentos/usuario/${dataUsers.value[i].id}/`)
          .then(result => {
            series.value.push(result.data.length)
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
      chartOptions.value = {
        chart: {
          width: 450,
          type: 'pie',
        },
        labels: usernames.value,
        title: {
          text: 'Archivos digitalizados',
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

    onMounted(async () => {
      $q.loading.show({
        message: 'Cargando...'
      })
      await getUsers(),
        await getNDocsByUser()
      $q.loading.hide()
    })

    return {
      series,
      chartOptions,
    }
  }
})
</script>
