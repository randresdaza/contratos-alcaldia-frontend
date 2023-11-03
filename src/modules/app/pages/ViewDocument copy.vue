<template>
  <div class="q-pa-xs" style="background-color:gainsboro;">
    <div class="q-pl-md q-pb-xs q-pt-md">
      <div>
        <q-btn round color="primary" icon="las la-arrow-left" @click="onBack" />
        <span class="q-ml-md" style="font-size: 14px; font-weight: bold;">VISOR DE DOCUMENTO</span>
      </div>
    </div>
    <div class="row justify-center">
      <span>Page</span>
    </div>
    <div class="q-pa-md q-mt-xs" style="background-color:gray; ">
      <!-- <object :data="fileUrl" type="application/pdf" width="100%" height="870px">
        <p>Tu navegador no soporta la visualización de PDF. Puedes <a :href="fileUrl">descargar el PDF</a> en su lugar.
        </p>
      </object> -->
      <canvas class="pdf-container" ref="pdfViewer" @contextmenu="preventContextMenu"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed, onBeforeMount } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import useAuth from 'src/modules/auth/composables/useAuth';
import moment from 'moment-timezone';
import CryptoJS from 'crypto-js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';

export default {
  props: ['file'],
  setup(props) {
    const $q = useQuasar()

    const router = useRouter()

    const fileUrl = ref('')

    const pdfViewer = ref(null)

    const onBack = () => {
      router.push({ name: 'docs' })
    }

    const decodeUrl = async () => {
      const claveSecreta = 'yEoKdfOAnPsMeU7YorhFGSbliDMclou8'
      const fileEncriptado = props.file
      const fileDesencriptado = await CryptoJS.AES.decrypt(fileEncriptado, claveSecreta).toString(CryptoJS.enc.Utf8)
      fileUrl.value = fileDesencriptado
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

    const loadAndDisplayPdf = async () => {
      try {
        const pdfData = await fetch(fileUrl.value);
        const pdfArrayBuffer = await pdfData.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
        const pdfPage = await pdfDoc.getPage(1);
        const canvas = pdfViewer.value;
        const context = canvas.getContext('2d');
        const viewport = pdfPage.getViewport({ scale: 2 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await pdfPage.render({ canvasContext: context, viewport }).promise;
      } catch (error) {
        console.error('Error al cargar y mostrar el PDF', error);
      }
    }

    onMounted(async () => {
      await decodeUrl(),
        await loadAndDisplayPdf()
    })

    return {
      onBack,
      pdfViewer,

      preventContextMenu(event) {
        event.preventDefault();
      }
    }
  }
}
</script>

<style scoped>
/* Aplica estilos específicos para ocultar el enlace de descarga */
@media print {
  .pdf-container {
    display: none;
  }
}

.pdf-container {
  width: 100%;
}
</style>
