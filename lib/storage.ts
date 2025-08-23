import { supabase } from '@/lib/supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadEventImage(file: File, eventId: string): Promise<UploadResult> {
  try {
    // Validar el archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y WebP.'
      }
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB.'
      }
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop()
    const fileName = `${eventId}-${Date.now()}.${fileExtension}`
    const filePath = `events/${fileName}`

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading to Supabase:', error)
      return {
        success: false,
        error: 'Error al subir la imagen. Inténtalo de nuevo.'
      }
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl
    }

  } catch (error) {
    console.error('Error in uploadEventImage:', error)
    return {
      success: false,
      error: 'Error inesperado al subir la imagen.'
    }
  }
}

export async function deleteEventImage(imageUrl: string): Promise<boolean> {
  try {
    // Extraer el path del archivo de la URL
    const urlParts = imageUrl.split('/')
    const filePath = urlParts.slice(-2).join('/') // events/filename.jpg

    const { error } = await supabase.storage
      .from('event-images')
      .remove([filePath])

    if (error) {
      console.error('Error deleting from Supabase:', error)
      return false
    }

    return true

  } catch (error) {
    console.error('Error in deleteEventImage:', error)
    return false
  }
}

export async function optimizeImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Redimensionar si es necesario (máximo 1200px de ancho)
      const maxWidth = 1200
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convertir a blob con calidad optimizada
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(optimizedFile)
          } else {
            resolve(file)
          }
        },
        'image/jpeg',
        0.8 // 80% de calidad
      )
    }

    img.src = URL.createObjectURL(file)
  })
}