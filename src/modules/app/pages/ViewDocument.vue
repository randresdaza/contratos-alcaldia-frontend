<template>
  <div class="q-mt-xs">
    <q-separator />
  </div>
  <div class="q-pl-md">
    <div class="q-mt-xs q-mb-xs">
      <q-btn round color="primary" icon="las la-arrow-left" @click="onBack" />
      <span class="q-ml-md" style="font-size: 14px; font-weight: bold;">VISOR DE DOCUMENTO</span>
    </div>
  </div>
  <div class="q-mb-xs">
    <q-separator />
  </div>

  <div style="background-color:gray;">
    <q-bar class="bg-grey-10 text-white q-pl-md q-pt-lg q-pb-lg q-pr-md">
      <q-field dark borderless class="text-h7 col col-xs-4 col-sm-4 col-md-4" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{ pdfName }}</div>
        </template>
        <!-- <q-tooltip class="bg-white text-black">{{ pdfName }}</q-tooltip> -->
      </q-field>

      <q-space />

      <q-btn round class="q-mr-md" color="grey-10" icon="las la-arrow-left" @click="backPage">
        <q-tooltip class="bg-white text-black">Pág. Anterior</q-tooltip>
      </q-btn>

      <q-input dark borderless class="text-h6 q-mr-xs" v-model="currentPage" style="width: 20px;"
        @keydown.enter="getCurrentPage" />

      <span class="text-h6"> / </span>

      <q-field dark borderless class="text-h7 q-ml-xs q-mr-md" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{ pdfPages }}</div>
        </template>
      </q-field>

      <q-btn round color="grey-10" icon="las la-arrow-right" @click="nextPage">
        <q-tooltip class="bg-white text-black">Pág. Siguiente</q-tooltip>
      </q-btn>

      <q-space />
      <q-space />
      <q-space />

      <q-btn round class="q-mr-xs" color="grey-10" icon="las la-search-minus" @click="zoomOut">
        <q-tooltip class="bg-white text-black">Reducir</q-tooltip>
      </q-btn>
      <q-btn round class="q-mr-xs" color="grey-10" icon="las la-search-plus" @click="zoomIn">
        <q-tooltip class="bg-white text-black">Ampliar</q-tooltip>
      </q-btn>
      <q-btn v-if="download == 'Activadas'" round class="q-mr-xs" color="grey-10" icon="las la-download"
        @click="onDownload">
        <q-tooltip class="bg-white text-black">Descargar</q-tooltip>
      </q-btn>
    </q-bar>
    <div class="flex flex-center q-pt-xs q-pb-xs">
      <canvas class="pdf-container" ref="pdfViewer" @contextmenu="preventContextMenu"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';
import CryptoJS from 'crypto-js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import 'pdfjs-dist/web/pdf_viewer.css'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default {
  props: ['idDoc', 'file'],
  setup(props) {
    const $q = useQuasar()
    const router = useRouter()
    const fileName = ref('')
    const pdfViewer = ref(null)
    const pdfPages = ref()
    const currentPage = ref(1)
    const numPage = ref(1)
    const scale = ref(1)
    const pdfName = ref()
    const { username } = useAuth()
    const download = ref('')

    const onBack = () => {
      router.push({ name: 'docs' })
    }

    const backPage = () => {
      if (numPage.value > 1) {
        numPage.value--
        currentPage.value = numPage.value
        loadAndDisplayPdf()
      }
    }

    const nextPage = () => {
      if (numPage.value < pdfPages.value) {
        numPage.value++
        currentPage.value = numPage.value
        loadAndDisplayPdf()
      }
    }

    const getCurrentPage = () => {
      if (currentPage.value > pdfPages.value) {
        currentPage.value = numPage.value
      } else if (currentPage.value == '') {
        currentPage.value = numPage.value
      } else if (currentPage.value == numPage.value) {
      } else if (currentPage.value > 0) {
        numPage.value = currentPage.value
        loadAndDisplayPdf()
      } else {
        currentPage.value = numPage.value
      }
    }

    const zoomOut = () => {
      if (scale.value > 1) {
        scale.value -= 0.1
        loadAndDisplayPdf()
      }
    }

    const zoomIn = () => {
      if (scale.value < 1.5) {
        scale.value += 0.1
        loadAndDisplayPdf()
      }
    }

    const onDownload = async () => {
      try {
        const response = await api.get(`/files/?fileName=${fileName.value}`, {
          responseType: 'arraybuffer'
        })
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', fileName.value);
        link.click();

        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error al descargar el archivo:', error);
      }
    }

    const decodeUrl = async () => {
      const claveSecreta = 'yEoKdfOAnPsMeU7YorhFGSbliDMclou8'
      const fileEncriptado = props.file
      const fileDesencriptado = await CryptoJS.AES.decrypt(fileEncriptado, claveSecreta).toString(CryptoJS.enc.Utf8)
      fileName.value = fileDesencriptado
    }

    const loadAndDisplayPdf = async () => {
      $q.loading.show({
        message: 'Cargando...'
      })
      try {
        const pdfData = await api.get(`/files/?fileName=${fileName.value}`, {
          responseType: 'arraybuffer'
        });
        const pdfArrayBuffer = pdfData.data
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfArrayBuffer, verbosity: 0 }).promise
        pdfPages.value = pdfDoc.numPages
        const pdfPage = await pdfDoc.getPage(Number(numPage.value))
        const canvas = pdfViewer.value
        const context = canvas.getContext('2d')
        const viewport = pdfPage.getViewport({ scale: scale.value })
        const outputScale = window.devicePixelRatio || 1

        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = Math.floor(viewport.width) + "px"
        canvas.style.height = Math.floor(viewport.height) + "px"

        const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null

        const renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport
        }
        await pdfPage.render(renderContext).promise
      } catch (error) {
        console.error('Error al cargar y mostrar el PDF', error)
      }
      $q.loading.hide()
    }

    const getData = async () => {
      await api.get(`/documentos/${props.idDoc}/`)
        .then(result => {
          const name = result.data.nombre
          pdfName.value = name.split('.')[0]
        })
        .catch(e => {
          console.log(e);
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
          download.value = result.data.descargas
        })
        .catch(e => {
          console.log(e);
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

    onMounted(async () => {
      await getData()
      await getDataUser()
      await decodeUrl()
      await loadAndDisplayPdf()
    })

    return {
      currentPage,
      pdfPages,
      onBack,
      backPage,
      nextPage,
      getCurrentPage,
      zoomOut,
      zoomIn,
      onDownload,
      pdfViewer,
      pdfName,
      download,

      preventContextMenu(event) {
        event.preventDefault();
      }
    }
  }
}
</script>

<style scoped>
@media print {
  .pdf-container {
    display: none;
  }
}

.container {
  display: inline-block;
}
</style>
