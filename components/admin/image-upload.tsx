'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  eventId?: string
  initialImage?: string
  onImageChange: (url: string) => void
  onImageRemove: () => void
}

export function ImageUpload({ eventId, initialImage, onImageChange, onImageRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(initialImage || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar archivo localmente
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y WebP.')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 5MB.')
      return
    }

    // Mostrar preview inmediatamente
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)

    if (!eventId) {
      // Si no hay eventId, solo mostrar preview local
      onImageChange(localUrl)
      return
    }

    // Subir archivo al servidor
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('eventId', eventId)

      const response = await fetch('/api/upload/event-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al subir la imagen')
      }

      const { url } = await response.json()
      
      // Limpiar preview local y usar URL del servidor
      URL.revokeObjectURL(localUrl)
      setPreviewUrl(url)
      onImageChange(url)
      
      toast.success('Imagen subida exitosamente')

    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen')
      
      // Revertir al estado anterior
      setPreviewUrl(initialImage || '')
      URL.revokeObjectURL(localUrl)
      
    } finally {
      setUploading(false)
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
    onImageRemove()
    toast.success('Imagen eliminada')
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                setPreviewUrl('')
                toast.error('Error al cargar la imagen')
              }}
            />
            
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Subiendo imagen...</span>
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openFileDialog}
              disabled={uploading}
            >
              Cambiar imagen
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Subir imagen del evento</p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP hasta 5MB
            </p>
          </div>
          <Button type="button" variant="outline" className="mt-4" disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            Seleccionar archivo
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Recomendado: 1200x600px para mejor visualización
      </p>
    </div>
  )
}