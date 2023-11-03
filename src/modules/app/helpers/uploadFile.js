import axios from 'axios'

const uploadFile = async (files) => {
  if (!files || files.length === 0) return null

  try {
    const uploadedFiles = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = file.name.split('.')
      const formData = new FormData()

      formData.append('upload_preset', 'file_pdf')
      formData.append('file', file)
      formData.append('public_id', fileName[0])
      formData.append('folder', 'files')
      formData.append('resource_type', 'pdf')

      const url = 'https://api.cloudinary.com/v1_1/drl3mxyh4/image/upload'
      const { data } = await axios.post(url, formData)

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
