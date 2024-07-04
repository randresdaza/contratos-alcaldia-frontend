<template>
  <div class="q-pa-md">
    <q-btn push class="q-mb-md q-pt-md q-pb-md" color="brown" icon-right="create_new_folder" label="Nuevo Contrato"
      @click="onNew" />

    <q-table class="my-sticky-header-table-contracts q-mt-xs" flat bordered title="Contratos" :rows="data"
      :columns="columns" row-key="id" virtual-scroll :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48" v-model:pagination.sync="pagination"
      :rows-per-page-options="[10, 20, 30, 50]" :rows-per-page-label="'Registros por página'" :filter="filter"
      :no-data-label="'No hay datos disponibles'" :no-results-label="'No se encontraron registros'"
      @request="onRequest">
      <template v-slot:top-right>
        <span class="text-subtitle2 q-mr-xs">Filtrar por fechas:</span>
        <q-field v-if="init && initFilter" class="q-ml-xs q-mr-xs" outlined label="Fecha Inicial" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" style="font-weight: bold;" tabindex="0">{{ init }}</div>
          </template>
          <q-icon size="20px" class="clickable-icon q-ml-xs q-pl-xs" v-if="init" name="cancel" @click="clearInitDate">
            <q-tooltip class="bg-black text-white">Borrar Filtro</q-tooltip>
          </q-icon>
        </q-field>

        <q-field v-if="to && endFilter" class="q-ml-xs q-mr-xs" outlined label="Fecha Final" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" style="font-weight: bold;" tabindex="0">{{ to }}</div>
          </template>
          <q-icon size="20px" class="clickable-icon q-ml-xs q-pl-xs" v-if="to" name="cancel" @click="clearEndDate">
            <q-tooltip class="bg-black text-white">Borrar Filtro</q-tooltip>
          </q-icon>
        </q-field>

        <q-btn outline rounded color="primary" class="q-ml-xs q-mr-xs">
          <div>Fecha Inicial</div>
          <q-icon right size="25px" name="event" />
          <q-popup-proxy transition-show="scale" transition-hide="scale" @show="showInit" @hide="hideInit">
            <q-date today-btn v-model="initDate" :locale="myLocale">
              <div class="row items-center justify-end q-gutter-xs">
                <q-btn v-close-popup label="Limpiar" color="primary" @click="clearInitDate" flat></q-btn>
                <q-btn v-close-popup label="Filtrar" color="primary" @click="filterByInitDate"></q-btn>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
        <q-btn outline rounded color="primary" class="q-ml-xs q-mr-xs">
          <div>Fecha Final</div>
          <q-icon right size="25px" name="event" />
          <q-popup-proxy transition-show="scale" transition-hide="scale" @show="showEnd" @hide="hideEnd">
            <q-date today-btn v-model="endDate" :locale="myLocale">
              <div class="row items-center justify-end q-gutter-xs">
                <q-btn v-close-popup label="Limpiar" color="primary" @click="clearEndDate" flat></q-btn>
                <q-btn v-close-popup label="Filtrar" color="primary" @click="filterByEndDate"></q-btn>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
        <div>
          <span class="text-subtitle2 q-ml-xs q-mr-md">Filtrar por asunto:</span>
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
            <q-btn push class="q-mr-xs" icon="las la-file-alt" color="standard" label="Ver Docs" text-color="black"
              stack glossy @click="onView(props.row)"></q-btn>
            <q-btn push class="q-mr-xs q-ml-xs" icon="las la-file-upload" color="light-green-5" label="Cargar Docs"
              text-color="black" stack glossy @click="onAddDocument(props.row)"></q-btn>
            <q-btn push class="q-mr-xs q-ml-xs" icon="las la-pencil-alt" color="amber-5" label="Editar"
              text-color="black" stack glossy @click="onEdit(props.row)"></q-btn>
            <!-- <q-btn push class="q-ml-xs" icon="las la-trash-alt" color="red-14" label="Eliminar" text-color="black" stack
              glossy @click="onDelete(props.row.id)"></q-btn> -->
          </q-td>
        </q-tr>
      </template>
    </q-table>

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
                        Tamaño máximo por archivo: 5 MB
                      </div>
                    </div>
                  </template>
                </q-file>
                <q-separator class="q-mt-md q-mb-md" />
                <br>
                <div class="row justify-around q-mb-md">
                  <q-btn push class="q-ma-xs" icon="las la-times" color="white" text-color="black" label="Cancelar"
                    stack glossy @click="modalDoc = false"></q-btn>
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
  </div>

</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';
import uploadFile from 'src/modules/app/helpers/uploadFile';

export default {
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const { user, logout } = useAuth()
    const pagination = ref({})
    const filter = ref('')
    const data = ref([])
    const modalDoc = ref(false)
    const file = ref(null)
    const fileSize = ref(Number)
    const nDocs = ref('')
    const isDocValid = ref(false)

    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const dayFormat = day.toString().padStart(2, '0')
    const monthFormat = month.toString().padStart(2, '0')
    const fromDate = `${year}/${monthFormat}/${dayFormat}`
    const toDate = `${year}/${monthFormat}/${dayFormat}`
    const dateFilter = ref({ from: fromDate, to: toDate })
    const init = ref('')
    const to = ref('')
    const oneDay = ref('')
    const today = ref(fromDate)
    const dateClosePopup = ref(Boolean)

    const initDate = ref('')
    const endDate = ref('')
    const initFilter = ref(false)
    const endFilter = ref(false)

    const filterInputRef = ref(null);

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
      { name: 'id', align: 'left', label: 'ID', field: 'id' },
      { name: 'asunto', align: 'left', label: 'ASUNTO', field: 'asunto' },
      { name: 'fecha_inicial', align: 'left', label: 'FECHA INICIAL', field: 'fecha_inicial' },
      { name: 'fecha_final', align: 'left', label: 'FECHA FINAL', field: 'fecha_final' },
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

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      getDataByDate(filter)
    }

    const getDataByDate = async (filter) => {
      await api.get(`/contratos/?filter=${filter}&page=${pagination.value.page}&page_size=${pagination.value.rowsPerPage}&initDate=${init.value}&endDate=${to.value}`)
        .then(result => {
          data.value = result.data.results;
          pagination.value.rowsNumber = result.data.count;
        })
        .catch(async (e) => {
          if (e.response.status == 401) {
            await logout()
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
              getDataByDate(filter.value)
            })
            .catch(async (e) => {
              if (e.response.status == 401) {
                await logout()
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
      formData.value = data
      modalDoc.value = true
    }

    const updateContract = async () => {
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
        usuario: user.value.id
      }
      await api.put(`/contratos/${formData.value.id}/`, contractToSave)
        .then(result => {
          getDataByDate(filter.value)
        })
        .catch(e => {
          modalDoc.value = false
          Swal.fire(
            'Error',
            'Su sesión ha expirado.<br>Vuelva a iniciar sesión.',
            'error',
          )
        })
    }

    const getNDocs = async () => {
      await api.get(`/documentos/contrato/${formData.value.id}/`)
        .then(result => {
          nDocs.value = result.data.count
          updateContract()
        })
        .catch(async (e) => {
          if (e.response.status == 401) {
            await logout()
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
        if (file.value[i].size <= 5500000) {
          isDocValid.value = true
          size += file.value[i].size
        } else {
          modalDoc.value = false
          isDocValid.value = false
          Swal.fire(
            {
              icon: 'error',
              title: 'Error',
              html: `El archivo ${file.value[i].name} supera el tamaño máximo permitido (5 MB).<br><br>Tamaño del archivo: ${(file.value[i].size / 1048576).toFixed(2)} MB`,
            }
          )
          break
        }
      }
      fileSize.value = (size / 1048576).toFixed(2)
    }

    const addDocument = async () => {
      let exist = false
      let date = new Date();
      try {
        $q.loading.show({
          message: 'Subiendo archivos. Por favor espere...',
          boxClass: 'bg-grey-2 text-grey-9',
          spinnerColor: 'primary'
        })
        const resp = await uploadFile(file.value)
        for (let i = 0; i < resp.length; i++) {
          let day = date.getDate()
          let month = date.getMonth() + 1
          let year = date.getFullYear()
          let hours = date.getHours()
          let minutes = date.getMinutes()
          let seconds = date.getSeconds()
          let dayFormat = day.toString().padStart(2, '0')
          let monthFormat = month.toString().padStart(2, '0')
          let hoursFormat = hours.toString().padStart(2, '0')
          let minutesFormat = minutes.toString().padStart(2, '0')
          let secondsFormat = seconds.toString().padStart(2, '0')
          let dateTime = `${year}-${monthFormat}-${dayFormat} ${hoursFormat}:${minutesFormat}:${secondsFormat}`
          if (!resp[i].existing) {
            let name = file.value[i].name
            let nameToSave = name.split('.').slice(0, -1).join('.')
            // let name = file.value[i].name.split('.')[0]
            let dataToSave = {
              nombre: nameToSave,
              fecha_creacion: dateTime,
              nro_paginas: resp[i].pages,
              contrato: formData.value.id,
              usuario: user.value.id
            }
            await api.post('/documentos/', dataToSave)
              .then(result => {
                getNDocs()
              })
              .catch(async (e) => {
                modalDoc.value = false
                if (e.response.status == 401) {
                  await logout()
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
          } else {
            exist = true
          }
        }
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
      } catch (error) {
        $q.loading.hide()
      }
    }

    const filterByInitDate = () => {
      if (initDate.value == '' || initDate.value == null) {
        Swal.fire(
          {
            icon: 'info',
            html: 'Por favor seleccione una fecha.',
          }
        )
        return
      }
      if (endDate.value.length != 0) {
        if (initDate.value > endDate.value) {
          Swal.fire(
            {
              icon: 'info',
              html: 'La fecha inicial no puede ser mayor a la fecha final.',
            }
          )
          return
        }
      }
      if (initDate.value) {
        initFilter.value = true
        const fromDate = initDate.value.replace(/\//g, '-')
        init.value = fromDate
        getDataByDate(filter.value)
      }
    }

    const filterByEndDate = () => {
      if (endDate.value == '' || endDate.value == null) {
        Swal.fire(
          {
            icon: 'info',
            html: 'Por favor seleccione una fecha.',
          }
        )
        return
      }
      if (initDate.value.length != 0) {
        if (endDate.value < initDate.value) {
          Swal.fire(
            {
              icon: 'info',
              html: 'La fecha final no puede ser menor a la fecha inicial.',
            }
          )
          return
        }
      }
      if (endDate.value) {
        endFilter.value = true
        const toDate = endDate.value.replace(/\//g, '-')
        to.value = toDate
        getDataByDate(filter.value)
      }
    }

    const showInit = () => {
      initDate.value = init.value.replace(/-/g, '/')
    }

    const showEnd = () => {
      endDate.value = to.value.replace(/-/g, '/')
    }

    const hideInit = () => {
      if (initFilter.value == false) {
        initDate.value = ''
      }
    }

    const hideEnd = () => {
      if (endFilter.value == false) {
        endDate.value = ''
      }
    }

    const clearFilter = () => {
      filter.value = ''
      filterInputRef.value.focus()
    }

    const onReset = () => {
      file.value = null
    }

    const clearInitDate = () => {
      initDate.value = ''
      init.value = ''
      initFilter.value = false
      getDataByDate(filter.value)
    }

    const clearEndDate = () => {
      endDate.value = ''
      to.value = ''
      endFilter.value = false
      getDataByDate(filter.value)
    }

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
      getDataByDate(filter.value)
    })

    return {
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
      onRequest,
      initDate,
      endDate,

      dateFilter,
      dateClosePopup,
      filterByInitDate,
      filterByEndDate,
      clearFilter,
      filterInputRef,
      oneDay,
      today,
      showInit,
      showEnd,
      hideInit,
      hideEnd,
      initFilter,
      endFilter,
      init, to,

      clearInitDate,
      clearEndDate,



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
  }
}
</script>

<style lang="sass">
.clickable-icon
  cursor: pointer

.center
  text-align: center

.my-sticky-header-table-contracts
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
