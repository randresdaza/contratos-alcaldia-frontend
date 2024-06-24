<template>
  <div class="q-pa-md">
    <q-form @submit="addData">
      <div class="row items-center">
        <q-input style="width: 300px;max-width: 80vw; max-height: 80vw;" filled v-model="formData.nombre"
          label="Nombre de la Subserie" type="text" lazy-rules
          :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />
        <q-btn push class="q-mb-lg q-mt-xs q-ml-md q-pt-md q-pb-md" color="secondary" icon-right="las la-save"
          label="Guardar" type="submit" />
      </div>
    </q-form>

    <q-table class="my-sticky-header-table-subseries q-mt-xs" virtual-scroll flat bordered title="Subseries"
      :rows="data" :columns="columns" :virtual-scroll-item-size="48" :virtual-scroll-sticky-size-start="48"
      row-key="nombre" v-model:pagination.sync="pagination" :rows-per-page-options="[10, 20, 30, 50]"
      :rows-per-page-label="'Registros por página'" :filter="filter" :no-data-label="'No hay datos disponibles'"
      :no-results-label="'No se encontraron registros'" @request="onRequest">
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
          <q-td key="id">{{ props.row.id }}</q-td>
          <q-td key="nombre">{{ props.row.nombre }}</q-td>
          <q-td class="right" key="actions">
            <q-btn push class="q-mr-xs" icon="las la-pencil-alt" color="amber" label="Editar" stack glossy
              @click="onEdit(props.row)"></q-btn>
            <q-btn push icon="las la-trash-alt" color="negative" label="Eliminar" stack glossy
              @click="onDelete(props.row.id)"></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="modal">
      <q-card class="q-gutter-xs" style="width: 500px;max-width: 80vw; max-height: 80vw;">
        <q-card-section class="row justify-center q-pa-xs q-mt-lg">
          <div class="text-h5">Información de la Subserie</div>
        </q-card-section>
        <q-card-section>
          <div class="row justify-center">
            <q-form @submit="updateData" @reset="onReset" class="col-xs-9 col-sm-9 col-md-10 q-gutter-xs">
              <q-input autofocus filled v-model="editData.nombre" label="Nombre" type="text" lazy-rules
                :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />
              <div class="row justify-center">
                <q-btn push icon-right="las la-broom" type="reset" color="blue" class="q-ml-sm q-mb-xs" />
              </div>
              <div class="row justify-between">
                <q-btn push class="q-ma-xs" icon="las la-times" color="white" text-color="black" label="Cancelar" stack
                  glossy @click="modal = false"></q-btn>
                <q-btn push class="q-ma-xs" type="submit" icon="las la-save" color="green" label="Guardar" stack
                  glossy></q-btn>
              </div>
            </q-form>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';

export default {
  setup() {
    const router = useRouter()
    const { logout } = useAuth()
    const pagination = ref({})
    const filter = ref('')
    const modal = ref(false)
    const data = ref([])

    const filterInputRef = ref(null);

    const formData = ref({
      nombre: '',
    })

    const editData = ref({
      id: '',
      nombre: '',
    })

    const columns = [
      { name: 'id', align: 'left', label: 'ID', field: 'id' },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: 'nombre' },
      { name: 'actions', align: 'right', label: 'ACCIONES' }
    ]

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      getData(filter)
    }

    const getData = async (filter) => {
      await api.get(`/subseries/?filter=${filter}&page=${pagination.value.page}&page_size=${pagination.value.rowsPerPage}`)
        .then(result => {
          data.value = result.data.results;
          pagination.value.rowsNumber = result.data.count;
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
      await api.post('/subseries/', formData.value)
        .then(result => {
          getData(filter.value)
          Swal.fire('Guardado', 'Registrado con éxito.', 'success')
        })
        .catch(e => {
          if (e.response.status == 400) {
            Swal.fire(
              {
                html: `Ya existe la subserie ${formData.value.nombre}.`,
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

    const updateData = async () => {
      await api.put(`/subseries/${editData.value.id}/`, editData.value)
        .then(result => {
          getData(filter.value)
          modal.value = false
          Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
        })
        .catch(e => {
          modal.value = false
          if (e.response.status == 400) {
            Swal.fire(
              {
                html: `Ya existe la subserie ${editData.value.nombre}.`,
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
          api.delete(`/subseries/${data}/`)
            .then(result => {
              getData(filter.value)
              Swal.fire(
                'Eliminado!',
                'Registro eliminado con éxito.',
                'success'
              )
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
      })
    }

    const onEdit = (data) => {
      modal.value = true
      editData.value = {
        id: data.id,
        nombre: data.nombre,
      }
    }

    const onReset = () => {
      editData.value = {
        nombre: '',
      }
    }

    const clearFilter = () => {
      filter.value = ''
      filterInputRef.value.focus()
    }

    watch(() => formData.value.nombre, (val) => {
      formData.value.nombre = val.toUpperCase();
    })

    watch(() => editData.value.nombre, (val) => {
      editData.value.nombre = val.toUpperCase();
    })

    onMounted(() => {
      getData(filter.value)
    })

    return {
      pagination,
      filter,
      columns,
      data,
      modal,
      formData,
      editData,
      addData,
      updateData,
      onEdit,
      onDelete,
      onReset,

      onRequest,
      clearFilter,
      filterInputRef,
    }
  }
}
</script>

<style lang="sass">
.clickable-icon
  cursor: pointer

.right
  text-align: right

.my-sticky-header-table-subseries
  /* height or max-height is important */
  height: 538px

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
