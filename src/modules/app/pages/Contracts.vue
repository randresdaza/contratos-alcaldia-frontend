<template>
  <div class="q-pa-lg">
    <q-btn push class="q-mb-md q-pt-md q-pb-md" color="brown" icon-right="las la-folder-plus" label="Nuevo Contrato"
      @click="onNew" />

    <q-table class="my-sticky-virtscroll-table q-mt-xs" virtual-scroll flat bordered title="Contratos" :rows="sortedData"
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
          <q-td key="asunto">{{ props.row.asunto }}</q-td>
          <q-td key="fecha_inicial">{{ props.row.fecha_inicial }}</q-td>
          <q-td key="fecha_final">{{ props.row.fecha_final }}</q-td>
          <q-td key="dependencia">{{ props.row.dependencia.nombre }}</q-td>
          <q-td key="serie">{{ props.row.serie.nombre }}</q-td>
          <q-td key="subserie">{{ props.row.subserie.nombre }}</q-td>
          <q-td key="estante">{{ props.row.estante }}</q-td>
          <q-td key="bandeja">{{ props.row.bandeja }}</q-td>
          <q-td key="caja">{{ props.row.caja }}</q-td>
          <q-td key="nro_orden">{{ props.row.nro_orden }}</q-td>
          <q-td key="nro_folios">{{ props.row.nro_folios }}</q-td>
          <q-td class="center" key="actions">
            <q-btn push class="q-mr-xs" icon="las la-file-alt" color="standard" label="Ver Docs" text-color="black" stack
              glossy @click="onView(props.row)"></q-btn>
            <q-btn push class="q-mr-xs q-ml-xs" icon="las la-file-upload" color="light-green-5" label="Cargar Docs"
              text-color="black" stack glossy @click="onAddDocument(props.row)"></q-btn>
            <q-btn push class="q-mr-xs q-ml-xs" icon="las la-pencil-alt" color="amber-5" label="Editar" text-color="black"
              stack glossy @click="onEdit(props.row)"></q-btn>
            <q-btn push class="q-ml-xs" icon="las la-trash-alt" color="red-14" label="Eliminar" text-color="black" stack
              glossy @click="onDelete(props.row.id)"></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="modalDoc">
    <q-card class="q-gutter-xs" style="width: 500px; max-width: 80vw; max-height: 80vw;">
      <q-card-section class="row justify-center q-pa-xs q-mt-md">
        <div class="text-h5 q-mt-md">
          Cargue de Documentos
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row justify-center">
          <q-form @submit="addDocument" @reset="onReset" class="col-xs-9 col-sm-9 col-md-10 q-gutter-xs">
            <div style="height:360px; max-height: 80vw;">
              <br>
              <q-separator class="q-mt-xs q-mb-lg" />
              <q-input filled v-model="formData.asunto" label="Asunto" type="text" lazy-rules
                :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" disable />
              <q-file v-model="file" label="Seleccione o arrastre archivos" outlined use-chips multiple
                :rules="[val => val && val.length > 0 || 'Este campo es obligatorio']" accept=".pdf">
                <template v-slot:prepend>
                  <q-icon name="las la-file-pdf" />
                </template>
                <template v-slot:append>
                  <q-icon name="close" @click.stop.prevent="file = null" class="cursor-pointer" />
                </template>
                <template v-slot:hint>
                  <div v-if="file">
                    Archivos seleccionados: {{ file.length }}
                    <div class="row justify-end">
                      Tamaño total: {{ fileSize }} MB
                    </div>
                  </div>
                  <div v-if="!file">
                    Solo se permiten archivos .pdf
                    <div class="row justify-end">
                      Tamaño máximo por archivo: 1 MB
                    </div>
                  </div>
                </template>
              </q-file>
              <q-separator class="q-mt-md q-mb-md" />
              <br>
              <div class="row justify-around q-mb-md">
                <q-btn push class="q-ma-xs" icon="las la-times" color="white" text-color="black" label="Cancelar" stack
                  glossy @click="modalDoc = false"></q-btn>
                <q-btn push class="q-ma-xs" type="submit" icon="las la-save" color="green" label="Guardar" stack
                  glossy></q-btn>
              </div>
              <br>
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';
import uploadFile from 'src/modules/app/helpers/uploadFile';
import moment from 'moment-timezone';


export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const { username } = useAuth()

    const pagination = ref({})
    const filter = ref('')

    const data = ref([])
    const dataUser = ref([])

    const modalDoc = ref(false)

    const file = ref(null)
    const fileSize = ref(Number)

    const nDocs = ref('')

    const isDocValid = ref(Boolean)

    const formData = ref({
      id: '',
      asunto: '',
      fecha_inicial: '',
      fecha_final: '',
      estante: '',
      bandeja: '',
      caja: '',
      nro_orden: '',
      nro_folios: '',
      observaciones: '',
      dependencia: '',
      serie: '',
      subserie: '',
      usuario: ''
    })

    const columns = [
      { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
      { name: 'asunto', align: 'left', label: 'ASUNTO', field: 'asunto' },
      { name: 'fecha_inicial', align: 'left', label: 'FECHA INICIAL', field: 'fecha_inicial', sortable: true },
      { name: 'fecha_final', align: 'left', label: 'FECHA FINAL', field: 'fecha_final', sortable: true },
      { name: 'dependencia', align: 'left', label: 'DEPENDENCIA', field: row => row.dependencia.nombre },
      { name: 'serie', align: 'left', label: 'SERIE', field: row => row.serie.nombre },
      { name: 'subserie', align: 'left', label: 'SUBSERIE', field: row => row.subserie.nombre },
      { name: 'estante', align: 'left', label: 'ESTANTE', field: 'estante' },
      { name: 'bandeja', align: 'left', label: 'BANDEJA', field: 'bandeja' },
      { name: 'caja', align: 'left', label: 'CAJA', field: 'caja' },
      { name: 'nro_orden', align: 'left', label: 'NÚMERO DE ORDEN', field: 'nro_orden' },
      { name: 'nro_folios', align: 'left', label: 'DOCUMENTOS', field: 'nro_folios' },
      { name: 'actions', align: 'center', label: 'ACCIONES' }
    ]

    const getData = async () => {
      await api.get('/contratos/')
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

    const getDataUser = async () => {
      await api.get(`/users/username/${username.value}/`)
        .then(result => {
          dataUser.value = result.data;
        })
        .catch(e => {
          console.log(e)
        })
    }

    const getDataContract = async (data) => {
      await api.get(`/contratos/${data.id}/`)
        .then(result => {
          formData.value = result.data;
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

    const onNew = () => {
      router.push({ name: 'new-contract' })
    }

    const onView = (data) => {
      router.push({ name: 'docs', params: { id: data.id } })
    }

    const onEdit = (data) => {
      router.push({ name: 'edit-contract', params: { id: data.id } })
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
          api.delete(`/contratos/${data}/`)
            .then(result => {
              Swal.fire(
                'Eliminado!',
                'Registro eliminado con éxito.',
                'success'
              )
              getData()
            })
            .catch(e => {
              console.log(e)
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
              } else if (e.response.status == 500) {
                Swal.fire(
                  {
                    icon: 'error',
                    title: 'Error',
                    html: 'No puede eliminar un contrato con documentos asociados a el.',
                  }
                )
              }
            })
        }
      })
    }

    const onAddDocument = (data) => {
      getDataUser()
      getDataContract(data)
      modalDoc.value = true
    }

    const updateContract = async () => {
      console.log('NDOCS', nDocs.value);
      const contractToSave = {
        asunto: formData.value.asunto,
        fecha_inicial: formData.value.fecha_inicial,
        fecha_final: formData.value.fecha_final,
        estante: formData.value.estante,
        bandeja: formData.value.bandeja,
        caja: formData.value.caja,
        nro_orden: formData.value.nro_orden,
        nro_folios: nDocs.value,
        observaciones: formData.value.observaciones,
        dependencia: formData.value.dependencia.id,
        serie: formData.value.serie.id,
        subserie: formData.value.subserie.id,
        usuario: dataUser.value.id
      }
      console.log("Data to save UPDATE CONTRACT", contractToSave);
      await api.put(`/contratos/${formData.value.id}/`, contractToSave)
        .then(result => {
          getData()
        })
        .catch(e => {
          modalDoc.value = false
          Swal.fire(
            'Error',
            'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
            'error',
          )
          console.log(e)
        })
    }

    const getNDocs = async () => {
      await api.get(`/documentos/contrato/${formData.value.id}/`)
        .then(result => {
          const data = result.data
          nDocs.value = data.length
          console.log('NDOCS ANTES UPDATE', nDocs.value);
          updateContract()
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

    const validateDocSize = async () => {
      let size = 0;
      for (let i = 0; i < file.value.length; i++) {
        if (file.value[i].size <= 1100000) {
          isDocValid.value = true
          size += file.value[i].size
        } else {
          modalDoc.value = false
          isDocValid.value = false
          Swal.fire(
            {
              icon: 'error',
              title: 'Error',
              html: `El archivo ${file.value[i].name} supera el tamaño máximo permitido (1 MB).<br><br>Tamaño: ${(file.value[i].size / 1048576).toFixed(2)} MB`,
            }
          )
          break
        }
      }
      fileSize.value = (size / 1048576).toFixed(2)
    }

    const addDocument = async () => {
      let exist = false
      $q.loading.show({
        message: 'Subiendo archivos. Por favor espere...',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'primary'
      })
      const resp = await uploadFile(file.value)
      console.log(resp);
      for (let i = 0; i < resp.length; i++) {
        let fullDate = resp[i].created_at
        let dateFormat = moment.tz(fullDate, 'YYYY-MM-DDTHH:mm:ss[Z]', 'UTC')
        let date = dateFormat.format('YYYY-MM-DD HH:mm:ss')
        if (!resp[i].existing) {
          let name = file.value[i].name.split('.')[0]
          let dataToSave = {
            nombre: name,
            fecha_creacion: date,
            nro_paginas: resp[i].pages,
            file: resp[i].secure_url,
            contrato: formData.value.id,
            usuario: dataUser.value.id
          }
          console.log('Data to Save: ', dataToSave);
          await api.post('/documentos/', dataToSave)
            .then(result => {
              console.log('Guardado: ', i);
            })
            .catch(e => {
              modalDoc.value = false
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
              console.log(e)
            })
        } else {
          exist = true
        }
      }
      getNDocs()
      $q.loading.hide()
      modalDoc.value = false
      if (exist) {
        Swal.fire({
          icon: 'info',
          html: 'Algunos archivos ya existen.'
        })
      } else {
        Swal.fire('Guardado', 'Registrado con éxito.', 'success')
      }


    }

    const onReset = () => {
      file.value = null
    }

    const sortedData = computed(() => {
      return [...data.value].sort((a, b) => b.id - a.id)
    })

    watch(modalDoc, (newValue) => {
      if (!newValue) {
        onReset()
      }
    })

    watch(file, (newValue) => {
      if (newValue) {
        validateDocSize()
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
      modalDoc,

      onNew,
      onView,
      onAddDocument,
      validateDocSize,
      onEdit,
      onDelete,
      formData,

      file,
      fileSize,

      addDocument,

      onReset,
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
