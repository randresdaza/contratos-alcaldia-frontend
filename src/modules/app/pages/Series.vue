<template>
  <div class="q-pa-lg">
    <q-form @submit="addData">
      <div class="row items-center">
        <q-input class="" style="width: 300px;max-width: 80vw; max-height: 80vw;" filled v-model="formData.nombre"
          label="Nombre de la Serie" type="text" lazy-rules
          :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />
        <q-btn push class="q-mb-lg q-mt-xs q-ml-md q-pt-md q-pb-md" color="secondary" icon-right="las la-save"
          label="Guardar" type="submit" />
      </div>
    </q-form>

    <q-table class="my-sticky-virtscroll-table q-mt-xs col justify-center" virtual-scroll flat bordered title="Series"
      :rows="sortedData" :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="nombre"
      v-model:pagination.sync="pagination" :rows-per-page-options="[5, 10, 30, 50]"
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
          <q-td key="nombre">{{ props.row.nombre }}</q-td>
          <q-td class="center" key="actions">
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
          <div class="text-h5">Información de la Serie</div>
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
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter()
    const pagination = ref({})
    const filter = ref('')
    const modal = ref(false)
    const data = ref([])

    const formData = ref({
      nombre: '',
    })

    const editData = ref({
      id: '',
      nombre: '',
    })

    const columns = [
      { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: 'nombre', sortable: true },
      { name: 'actions', align: 'right', label: 'ACCIONES' }
    ]

    const getData = async () => {
      await api.get('/series/')
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
    }

    const addData = async () => {
      await api.post('/series/', formData.value)
        .then(result => {
          Swal.fire('Guardado', 'Registrado con éxito.', 'success')
          getData()
        })
        .catch(e => {
          if (e.response.status == 400) {
            Swal.fire(
              {
                html: `Ya existe la serie ${formData.value.nombre}.`,
                icon: 'info'
              }
            )
          } else if (e.response.status == 401) {
            Swal.fire(
              {
                html: 'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
                icon: 'info'
              }
            )
          }
        })
    }

    const updateData = async () => {
      await api.put(`/series/${editData.value.id}/`, editData.value)
        .then(result => {
          modal.value = false
          Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
          getData()
        })
        .catch(e => {
          modal.value = false
          Swal.fire(
            'Error',
            'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
            'info',
          )
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
          api.delete(`/series/${data}/`)
            .then(result => {
              Swal.fire(
                'Eliminado!',
                'Registro eliminado con éxito.',
                'success'
              )
              getData()
            })
            .catch(e => {
              Swal.fire(
                'Error',
                'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
                'info',
              )
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

    const sortedData = computed(() => {
      return [...data.value].sort((a, b) => b.id - a.id)
    })

    watch(modal, (newValue) => {
      if (!newValue) {
        onReset()
      }
    })

    onMounted(() => {
      getData()
    })

    return {
      sortedData,
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
    }
  }
}
</script>

<style lang="sass" scoped>
.center
  text-align: right
.my-sticky-virtscroll-table
  /* height or max-height is important */
  height: 518px

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
