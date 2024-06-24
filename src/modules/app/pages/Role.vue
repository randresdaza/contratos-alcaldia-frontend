<template>
  <div class="q-pa-xl" style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
    <q-form @submit="addData">
      <div class="row items-center">
        <q-select style="width: 200px;max-width: 80vw; max-height: 80vw;" filled v-model="formData.name"
          :options="roles" label="Seleccionar Rol" :rules="[val => !!val || 'Este campo es obligatorio']" />
        <q-btn push class="q-mb-lg q-mt-xs q-ml-md q-pt-md q-pb-md" color="secondary" icon-right="las la-save"
          label="Guardar" type="submit" />
      </div>
    </q-form>

    <q-table class="my-sticky-header-table-roles q-mt-md col justify-center"
      style="width: 500px; max-width: 80vw; max-height: 80vw;" virtual-scroll flat bordered title="Roles" :rows="data"
      :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="id" v-model:pagination.sync="pagination"
      :rows-per-page-options="[]" :rows-per-page-label="'Registros por página'" :filter="filter"
      :no-data-label="'No hay datos disponibles'" :no-results-label="'No se encontraron registros'">
      <template v-slot:top-right>
        <!-- <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
</q-input> -->
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name">{{ props.row.name }}</q-td>
          <q-td class="right" key="actions">
            <q-btn push icon="las la-trash-alt" color="negative" label="Eliminar" stack glossy
              @click="onDelete(props.row)"></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';


export default {
  setup() {
    const router = useRouter()
    const pagination = ref({})
    const filter = ref('')

    const data = ref([])

    const formData = ref({
      name: '',
    })

    const columns = [
      { name: 'name', align: 'left', label: 'NOMBRE', field: 'name', sortable: true },
      { name: 'actions', align: 'right', label: 'ACCIONES' }
    ]

    const getData = async () => {
      await api.get('/roles/')
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
                logout()
              } else {
                router.push({ name: 'login' })
                logout()
              }
            })
          }
        })
    }

    const addData = async () => {
      await api.post('/roles/', formData.value)
        .then(result => {
          Swal.fire('Guardado', 'Registrado con éxito.', 'success')
          getData()
        })
        .catch(e => {
          if (e.response.status == 400) {
            Swal.fire(
              {
                html: `Ya existe el rol (${formData.value.name}).`,
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
                logout()
              } else {
                router.push({ name: 'login' })
                logout()
              }
            })
          }
        })
    }

    const onDelete = (data) => {
      Swal.fire({
        title: '¿Está seguro que desea eliminar?',
        text: "No podrá revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          api.delete(`/roles/${data.id}/`)
            .then(result => {
              Swal.fire(
                'Eliminado!',
                'Registro eliminado con éxito.',
                'success'
              )
              getData()
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
              } else if (e.response.status == 500) {
                Swal.fire(
                  {
                    icon: 'error',
                    title: 'Error',
                    html: `El rol (${data.name}) se encuentra asociado a uno o varios usuarios.`,
                  }
                )
              }
            })
        }
      })
    };

    onMounted(() => {
      getData()
    })

    return {
      pagination,
      filter,
      columns,
      data,

      formData,

      addData,
      onDelete,

      roles: [
        'Administrador', 'Supervisor', 'Digitador'
      ],
    }
  }
}
</script>


<style lang="sass">
.right
  text-align: right

.my-sticky-header-table-roles
  /* height or max-height is important */
  height: 380px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #f5f5f5

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
