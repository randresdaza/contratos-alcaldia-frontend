<template>
  <div class="q-pa-md">
    <q-btn push class="q-mb-md q-pt-md q-pb-md" color="secondary" icon-right="person_add" label="Nuevo Usuario"
      @click="onNew" />

    <q-table class="my-sticky-header-table-users q-mt-xs" virtual-scroll flat bordered title="Usuarios" :rows="data"
      :columns="columns" :virtual-scroll-sticky-size-start="48" row-key="id" v-model:pagination.sync="pagination"
      :rows-per-page-options="[10, 20, 30, 50]" :rows-per-page-label="'Registros por página'" :filter="filter"
      :no-data-label="'No hay datos disponibles'" :no-results-label="'No se encontraron registros'"
      @request="onRequest">
      <template v-slot:top-right>
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
          <q-td key="username">{{ props.row.username }}</q-td>
          <q-td key="name">{{ props.row.name }}</q-td>
          <q-td key="email">{{ props.row.email }}</q-td>
          <q-td key="role">{{ props.row.role.name }}</q-td>
          <q-td key="downloads">
            <q-icon class="clickable-icon" size="35px" :name="props.row.downloads ? 'check_circle' : 'cancel'"
              :color="props.row.downloads ? 'green' : 'red'" @click="updateDownloads(props.row)" />
            {{ props.row.downloads ? 'Activadas' : 'Desactivadas' }}
          </q-td>
          <q-td key="is_active">
            <q-icon class="clickable-icon" size="35px" :name="props.row.is_active ? 'check_circle' : 'cancel'"
              :color="props.row.is_active ? 'green' : 'red'" @click="updateStatus(props.row)" />
            {{ props.row.is_active ? 'Activo' : 'Inactivo' }}

          </q-td>
          <q-td key="actions">
            <q-btn push class="q-mr-xs" icon="las la-pencil-alt" color="amber" label="Editar" stack glossy
              @click="onEdit(props.row)"></q-btn>
            <q-btn push class="q-ml-xs" icon="las la-trash-alt" color="negative" label="Eliminar" stack glossy
              @click="onDelete(props.row)"></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="modal" style="z-index: 1000;">
    <q-card v-if="card" class="q-gutter-xs" style="width: 500px; max-width: 90vw; max-height: 90vw;"
      :style="{ height: cardHeight }">
      <q-card-section class="row justify-center q-pa-xs q-mt-md">
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

            <q-select filled v-model="formData.role" :options="roles" label="Rol" option-label="name"
              :rules="[val => !!val || 'Este campo es obligatorio']" />

            <div class="row justify-center">
              <q-checkbox name="downloads" class="q-mr-xs" color="green" v-model="formData.downloads"
                checked-icon="task_alt" unchecked-icon="highlight_off" size="45px">
                Descargas</q-checkbox>
              <q-checkbox name="status" class="q-ml-xs" color="green" v-model="formData.is_active"
                checked-icon="task_alt" unchecked-icon="highlight_off" size="45px">Estado</q-checkbox>
            </div>

            <div class="row justify-between q-mt-md q-mb-md">
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
import useAuth from 'src/modules/auth/composables/useAuth';

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
    const roles = ref([])
    const { logout } = useAuth()

    const filterInputRef = ref(null);

    const formData = ref({
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      role: '',
      downloads: false,
      is_active: false,
    })

    const columns = [
      // { name: 'id', align: 'left', label: 'ID', field: 'id' },
      { name: 'username', align: 'left', label: 'USUARIO', field: 'username' },
      { name: 'nombre', align: 'left', label: 'NOMBRE', field: 'name' },
      { name: 'email', align: 'left', label: 'CORREO', field: 'email' },
      { name: 'role', align: 'left', label: 'ROL', field: row => row.role.name },
      { name: 'downloads', align: 'left', label: 'DESCARGAS', field: 'downloads' },
      { name: 'is_active', align: 'left', label: 'ESTADO', field: 'is_active' },
      { name: 'actions', align: 'left', label: 'ACCIONES' }
    ]

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      getData(filter)
    }

    const getData = async (filter) => {
      await api.get(`/users/?filter=${filter}&page=${pagination.value.page}&page_size=${pagination.value.rowsPerPage}`)
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

    const getRols = async () => {
      await api.get('/roles/')
        .then(result => {
          roles.value = result.data
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
      formData.value = {
        username: formData.value.username,
        password: formData.value.password,
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role.id,
        downloads: formData.value.downloads,
        is_active: formData.value.is_active
      }
      await api.post('/users/', formData.value)
        .then(result => {
          modal.value = false
          Swal.fire('Guardado', 'Registrado con éxito.', 'success')
          getData(filter.value)
        })
        .catch(e => {
          const message = JSON.parse(e.request.responseText)
          if (message.username) {
            Swal.fire({
              title: 'Error',
              text: message.username[0],
              icon: 'error',
              customClass: 'my-swal'
            })
          }
          if (message.email) {
            Swal.fire({
              title: 'Error',
              text: message.email[0],
              icon: 'error',
              customClass: 'my-swal'
            })
          }
          // Swal.fire(
          //   'Error',
          //   'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
          //   'error',
          // )
        })
    }

    const updateData = async () => {
      const dataToSave = {
        id: formData.value.id,
        username: formData.value.username,
        name: formData.value.name,
        email: formData.value.email,
        is_active: formData.value.is_active,
        downloads: formData.value.downloads,
        role: formData.value.role.id
      }
      await api.put(`/users/${formData.value.id}/`, dataToSave)
        .then(result => {
          modal.value = false
          Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
          getData(filter.value)
        })
        .catch(e => {
          const message = JSON.parse(e.request.responseText)
          if (message.username) {
            Swal.fire({
              title: 'Error',
              text: message.username[0],
              icon: 'error',
              customClass: 'my-swal'
            })
          }
          if (message.email) {
            Swal.fire({
              title: 'Error',
              text: message.email[0],
              icon: 'error',
              customClass: 'my-swal'
            })
          }
          if (e.response.status == 401) {
            Swal.fire(
              {
                html: 'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
                icon: 'info',
                customClass: 'my-swal'
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

    const updateDownloads = async (props) => {
      if (props.downloads) {
        if (props.role.name == "Administrador") {
          Swal.fire('', 'No puede cambiar los permisos de un usuario administrador.', 'info')
        } else {
          await api.put(`/users/${props.id}/`, { downloads: !props.downloads })
            .then(result => {
              modal.value = false
              Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
              getData(filter.value)
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
      } else {
        await api.put(`/users/${props.id}/`, { downloads: !props.downloads })
          .then(result => {
            modal.value = false
            Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
            getData(filter.value)
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
    }

    const updateStatus = async (props) => {
      if (props.is_active) {
        await api.put(`/users/${props.id}/`, { is_active: !props.is_active })
          .then(result => {
            modal.value = false
            Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
            getData(filter.value)
          })
          .catch(e => {
            modal.value = false
            Swal.fire(
              'Error',
              'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
              'info',
            )
          })
      } else {
        await api.put(`/users/${props.id}/`, { is_active: !props.is_active })
          .then(result => {
            modal.value = false
            Swal.fire('Guardado', 'Actualizado con éxito.', 'success')
            getData(filter.value)
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
    }

    const onNew = () => {
      getRols()
      modal.value = true
      edit.value = false
      card.value = true
      cardHeight.value = '590px'
    }

    const onEdit = (data) => {
      getRols()
      modal.value = true
      edit.value = true
      card.value = true
      cardHeight.value = '561px'
      formData.value = {
        id: data.id,
        username: data.username,
        name: data.name,
        email: data.email,
        is_active: data.is_active,
        downloads: data.downloads,
        role: data.role.name
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
          api.delete(`/users/${data.id}/`)
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
              } else if (e.response.status == 500) {
                Swal.fire(
                  {
                    icon: 'error',
                    title: 'Error',
                    html: `El usuario (${data.username}) cuenta con historicos o reportes.<br>Implosible eliminar.`,
                  }
                )
              }
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
        role: '',
        downloads: false,
        is_active: false,
      }
      checkPassword.value = ''
    }

    const clearFilter = () => {
      filter.value = ''
      filterInputRef.value.focus()
    }

    watch(modal, (newValue) => {
      if (!newValue) {
        onReset()
        edit.value = false
      }
    })

    onMounted(() => {
      getData(filter.value)
    })

    return {
      pagination,
      filter,
      columns,
      data,
      onRequest,
      clearFilter,
      filterInputRef,

      modal,
      edit,
      card,
      cardHeight,
      onNew,
      onEdit,
      onDelete,
      formData,
      checkPassword,
      roles,
      addData,
      updateData,
      updateDownloads,
      updateStatus,
      onReset,

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


<style lang="sass">
.my-swal
  z-index: 1060

.clickable-icon
  cursor: pointer

.my-sticky-header-table-users
  /* height or max-height is important */
  height: 550px

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
