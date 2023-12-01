<template>
  <div class="q-pa-lg">
    <q-btn push class="q-mb-md q-pt-md q-pb-md" color="secondary" icon-right="las la-user-plus" label="Nuevo Usuario"
      @click="onNew" />

    <q-table class="my-sticky-virtscroll-table q-mt-xs" virtual-scroll flat bordered title="Usuarios" :rows="sortedData"
      :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="id" v-model:pagination.sync="pagination"
      :rows-per-page-options="[5, 10, 30, 50]" :rows-per-page-label="'Registros por página'" :filter="filter"
      :no-data-label="'No hay datos disponibles'" :no-results-label="'No se encontraron registros'">
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
          <q-td key="username">{{ props.row.username }}</q-td>
          <q-td key="name">{{ props.row.name }}</q-td>
          <q-td key="email">{{ props.row.email }}</q-td>
          <q-td key="rol">{{ props.row.rol.nombre }}</q-td>
          <q-td key="estado">{{ props.row.estado }}</q-td>
          <q-td key="descargas">{{ props.row.descargas }}</q-td>
          <q-td class="center" key="actions">
            <q-btn push class="q-mr-xs" icon="las la-pencil-alt" color="amber" label="Editar" stack glossy
              @click="onEdit(props.row)"></q-btn>
            <q-btn push class="q-ml-xs" icon="las la-trash-alt" color="negative" label="Eliminar" stack glossy
              @click="onDelete(props.row.id)"></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="modal">
    <q-card v-if="card" class="q-gutter-xs" style="width: 500px;max-width: 80vw; max-height: 80vw;"
      :style="{ height: cardHeight }">
      <q-card-section class="row justify-center q-pa-xs q-mt-lg">
        <div class="text-h5">Información del Usuario</div>
      </q-card-section>
      <q-card-section>
        <div class="row justify-center">
          <q-form @submit="!edit ? addData() : updateData()" @reset="onReset"
            class="col-xs-9 col-sm-9 col-md-10 q-gutter-xs">
            <q-input autofocus filled v-model="formData.username" label="Usuario" type="text" lazy-rules
              :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />

            <q-input filled v-model="formData.name" label="Nombre" type="text" lazy-rules
              :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />

            <q-input filled v-model="formData.email" label="Correo electrónico" type="email" lazy-rules :rules="[val => val && val.length > 0 || 'Este campo es obligatorio',
              isValidEmail]" />

            <q-input v-if="!edit" filled v-model="formData.password" type="password" label="Contraseña" lazy-rules
              :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" />

            <q-input v-if="!edit" filled v-model="checkPassword" type="password" label="Confirmar contraseña" lazy-rules
              :rules="[val => val && val.length > 0 || 'Este campo es obligatorio', isSamePassword]" />

            <q-select filled v-model="formData.rol" :options="rols" label="Rol" option-label="nombre"
              :rules="[val => !!val || 'Este campo es obligatorio']" />

            <q-select v-if="edit" filled v-model="formData.estado" :options="status" label="Estado"
              :rules="[val => !!val || 'Este campo es obligatorio']" />

            <q-select v-if="edit" filled v-model="formData.descargas" :options="downloads" label="Descargas"
              :rules="[val => !!val || 'Este campo es obligatorio']" />

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
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter()
    const pagination = ref({})
    const filter = ref('')
    const data = ref([])
    const modal = ref(false)
    const edit = ref(false)
    const card = ref(false)
    const cardHeight = ref('')
    const checkPassword = ref('')
    const rols = ref([])

    const formData = ref({
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      estado: '',
      descargas: '',
      rol: '',
    })

    const columns = [
      { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
      { name: 'username', align: 'left', label: 'USUARIO', field: 'username' },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: 'name' },
      { name: 'email', align: 'left', label: 'CORREO', field: 'email' },
      { name: 'rol', align: 'left', label: 'ROL', field: row => row.rol.nombre },
      { name: 'estado', align: 'left', label: 'ESTADO', field: 'estado', sortable: true },
      { name: 'descargas', align: 'left', label: 'DESCARGAS', field: 'descargas', sortable: true },
      { name: 'actions', align: 'right', label: 'ACCIONES' }
    ]

    const getData = async () => {
      await api.get('/users/')
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

    const getRols = async () => {
      await api.get('/roles/')
        .then(result => {
          rols.value = result.data
        })
        .catch(e => {

        })
    }

    const addData = async () => {
      formData.value = {
        username: formData.value.username,
        password: formData.value.password,
        name: formData.value.name,
        email: formData.value.email,
        rol: formData.value.rol.id
      }
      await api.post('/users/', formData.value)
        .then(result => {
          modal.value = false
          Swal.fire('Guardado', 'Registrado con éxito.', 'success')
          getData()
        })
        .catch(e => {
          modal.value = false
          Swal.fire(
            'Error',
            'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
            'error',
          )
        })
    }

    const updateData = async () => {
      const dataToSave = {
        id: formData.value.id,
        username: formData.value.username,
        name: formData.value.name,
        email: formData.value.email,
        estado: formData.value.estado,
        descargas: formData.value.descargas,
        rol: formData.value.rol.id
      }
      await api.put(`/users/${formData.value.id}/`, dataToSave)
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

    const onNew = () => {
      getRols()
      modal.value = true
      edit.value = false
      card.value = true
      cardHeight.value = '700px'
    }

    const onEdit = (data) => {
      getRols()
      modal.value = true
      edit.value = true
      card.value = true
      // cardHeight.value = '700px'
      formData.value = {
        id: data.id,
        username: data.username,
        name: data.name,
        email: data.email,
        estado: data.estado,
        descargas: data.descargas,
        rol: data.rol.nombre
      }
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
          api.delete(`/users/${data}/`)
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
              ).then((result) => {
                if (result.isConfirmed) {
                  router.push({ name: 'login' })
                } else {
                  router.push({ name: 'login' })
                }
              })
            })
        }
      })
    }

    const onReset = () => {
      formData.value = {
        username: '',
        password: '',
        name: '',
        email: '',
        rol: ''
      }
      checkPassword.value = ''
    }

    const sortedData = computed(() => {
      return [...data.value].sort((a, b) => b.id - a.id)
    })

    watch(modal, (newValue) => {
      if (!newValue) {
        onReset()
        edit.value = false
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
      edit,
      card,
      cardHeight,
      onNew,
      onEdit,
      onDelete,
      formData,
      checkPassword,
      rols,
      addData,
      updateData,
      onReset,

      status: [
        'Activo', 'Inactivo'
      ],
      downloads: [
        'Activadas', 'Desactivadas'
      ],
      isValidEmail(val) {
        const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
        return emailPattern.test(val) || 'El correo no parece ser válido';
      },
      isSamePassword(val) {
        return (val === formData.value.password) || 'Las contraseñas no coinciden'
      },
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
