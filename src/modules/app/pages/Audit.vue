<template>
  <div class="q-pa-lg">
    <q-table class="my-sticky-virtscroll-table" virtual-scroll flat bordered title="Históricos por Usuario"
      :rows="sortedData" :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="id"
      v-model:pagination.sync="pagination" :rows-per-page-options="[10, 20, 30, 50]"
      :rows-per-page-label="'Registros por página'" :filter="filter" :no-data-label="'No hay datos disponibles'"
      :no-results-label="'No se encontraron registros'">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
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
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios';

export default {
  setup() {
    const pagination = ref({})
    const filter = ref('')
    const data = ref([])

    const columns = [
      { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
      { name: 'evento_sobre', align: 'left', label: 'TABLA AFECTADA', field: 'evento_sobre' },
      { name: 'fecha', align: 'left', label: 'FECHA', field: 'fecha', sortable: true },
      { name: 'accion', align: 'left', label: 'ACCIÓN', field: 'accion' },
      { name: 'usuario', align: 'left', label: 'USUARIO', field: row => row.usuario.username },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: row => row.usuario.name },
      { name: 'contrato', align: 'left', label: 'CONTRATO', field: row => row.contrato.asunto },
      { name: 'documento', align: 'left', label: 'DOCUMENTO', field: row => row.documento.nombre },
      // { name: 'contrato_documento', align: 'left', label: 'CONTRATO ASOCIADO', field: row => row.documento.contrato.asunto },
    ]

    const getData = async () => {
      await api.get('/historicos/')
        .then(result => {
          data.value = result.data;
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
              } else {
                router.push({ name: 'login' })
              }
            })
          }
        })
    }

    const sortedData = computed(() => {
      return [...data.value].sort((a, b) => b.id - a.id)
    })

    onMounted(() => {
      getData()
    })

    return {
      pagination,
      filter,
      columns,
      sortedData
    }
  },
}
</script>

<style lang="sass" scoped>
.my-sticky-virtscroll-table
  /* height or max-height is important */
  height: 595px

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
