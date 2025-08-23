'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, EventFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users, Euro, Tag, Image, Save, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface EventFormProps {
  event?: EventFormData & { id?: string }
  onSubmit: (data: EventFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const categoryOptions = [
  { value: 'murder', label: 'Asesinato/Murder Mystery' },
  { value: 'escape', label: 'Escape Room' },
  { value: 'detective', label: 'Detective' },
  { value: 'horror', label: 'Terror/Horror' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'soldout', label: 'Agotado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function EventForm({ event, onSubmit, onCancel, isLoading }: EventFormProps) {
  const [previewImage, setPreviewImage] = useState(event?.imageUrl || '')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      ...event,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
    } : {
      status: 'draft',
      category: 'murder',
      duration: 120,
      capacity: 20,
      price: 35,
    },
  })

  const watchImageUrl = watch('imageUrl')

  const handleImageUrlChange = (url: string) => {
    setValue('imageUrl', url)
    setPreviewImage(url)
  }

  const isEdit = !!event?.id

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {isEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título del Evento *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ej: Asesinato en el Orient Express"
                className="mt-1"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe el evento, la experiencia que vivirán los participantes..."
                rows={4}
                className="mt-1"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select onValueChange={(value) => setValue('category', value as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <Label htmlFor="imageUrl">URL de Imagen</Label>
            <div className="space-y-4">
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="mt-1"
                onChange={(e) => handleImageUrlChange(e.target.value)}
              />
              {errors.imageUrl && (
                <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>
              )}
              
              {previewImage && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewImage('')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="time">Hora *</Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  {...register('time')}
                  className="pl-10"
                />
              </div>
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duración (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="120"
                min="30"
                max="480"
                className="mt-1"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Ubicación y capacidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Ej: Teatro Principal, Madrid"
                  className="pl-10"
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="capacity">Capacidad *</Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="capacity"
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  placeholder="20"
                  min="1"
                  max="100"
                  className="pl-10"
                />
              </div>
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          {/* Precio */}
          <div className="max-w-xs">
            <Label htmlFor="price">Precio (€) *</Label>
            <div className="relative mt-1">
              <Euro className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="35.00"
                min="0"
                max="1000"
                className="pl-10"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : isEdit ? 'Actualizar Evento' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}