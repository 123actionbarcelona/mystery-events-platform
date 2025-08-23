'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Filter, Download, Eye } from 'lucide-react'

interface Booking {
  id: string
  bookingCode: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  eventTitle: string
  eventDate: string
  quantity: number
  totalAmount: number
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: string
  updatedAt: string
}

// Mock data para mostrar mientras no hay BD
const mockBookings: Booking[] = [
  {
    id: "b1",
    bookingCode: "MST-2025-001",
    customerName: "Ana García",
    customerEmail: "ana.garcia@email.com",
    customerPhone: "+34 666 777 888",
    eventTitle: "El Misterio de la Mansión Victorian",
    eventDate: "2025-08-25",
    quantity: 2,
    totalAmount: 90.00,
    paymentStatus: "completed",
    createdAt: "2025-08-20T10:30:00Z",
    updatedAt: "2025-08-20T10:30:00Z"
  },
  {
    id: "b2", 
    bookingCode: "MST-2025-002",
    customerName: "Carlos López",
    customerEmail: "carlos.lopez@email.com",
    customerPhone: "+34 699 888 999",
    eventTitle: "Escape Room: La Prisión de Alcatraz",
    eventDate: "2025-08-26",
    quantity: 4,
    totalAmount: 100.00,
    paymentStatus: "completed",
    createdAt: "2025-08-20T09:15:00Z",
    updatedAt: "2025-08-20T09:15:00Z"
  },
  {
    id: "b3",
    bookingCode: "MST-2025-003", 
    customerName: "María Rodríguez",
    customerEmail: "maria.rodriguez@email.com",
    eventTitle: "Detective Privado: El Caso del Collar Perdido",
    eventDate: "2025-08-27",
    quantity: 1,
    totalAmount: 35.00,
    paymentStatus: "pending",
    createdAt: "2025-08-20T08:45:00Z",
    updatedAt: "2025-08-20T08:45:00Z"
  },
  {
    id: "b4",
    bookingCode: "MST-2025-004",
    customerName: "José Martín",
    customerEmail: "jose.martin@email.com",
    eventTitle: "Murder Mystery: Cena con Crimen", 
    eventDate: "2025-08-30",
    quantity: 3,
    totalAmount: 195.00,
    paymentStatus: "failed",
    createdAt: "2025-08-19T19:20:00Z",
    updatedAt: "2025-08-19T19:20:00Z"
  }
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setBookings(mockBookings)
      setFilteredBookings(mockBookings)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = bookings

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === statusFilter)
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800', 
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      completed: 'Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
      refunded: 'Reembolsado'
    }

    return (
      <Badge className={variants[status] || variants.pending}>
        {labels[status] || status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (amount: number) => {
    return `€${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reservas</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-gray-600">Gestiona todas las reservas de eventos</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código, cliente, email o evento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completado</option>
                <option value="pending">Pendiente</option>
                <option value="failed">Fallido</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-sm text-gray-600">Total reservas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.paymentStatus === 'completed').length}
            </div>
            <p className="text-sm text-gray-600">Completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.paymentStatus === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatPrice(bookings.reduce((sum, b) => sum + (b.paymentStatus === 'completed' ? b.totalAmount : 0), 0))}
            </div>
            <p className="text-sm text-gray-600">Ingresos</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas ({filteredBookings.length})</CardTitle>
          <CardDescription>
            Lista completa de reservas con filtros aplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron reservas con los filtros aplicados
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {booking.bookingCode}
                        </span>
                        {getStatusBadge(booking.paymentStatus)}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">{booking.customerName}</h4>
                        <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                        {booking.customerPhone && (
                          <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium">{booking.eventTitle}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.eventDate).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{booking.quantity} tickets</span>
                        <span className="font-semibold">{formatPrice(booking.totalAmount)}</span>
                        <span>Creada: {formatDate(booking.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}