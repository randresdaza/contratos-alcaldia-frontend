import { api } from 'src/boot/axios';

const uploadFile = async (files) => {
  if (!files || files.length === 0) return null
  try {
    const uploadedFiles = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/files/', formData)
      uploadedFiles.push(data)
    }
    return uploadedFiles
  } catch (error) {
    console.error('Error al cargar archivos, revisar logs')
    console.log(error)
    return null
  }
}

export default uploadFile
