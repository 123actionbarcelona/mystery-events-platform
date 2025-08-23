'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  Euro, 
  Ticket, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalBookings: number
  totalCustomers: number
  totalRevenue: number
  recentEvents: Array<{
    id: string
    title: string
    date: string
    status: string
    bookedTickets: number
    capacity: number
  }>
  recentBookings: Array<{
    id: string
    bookingCode: string
    customerName: string
    eventTitle: string
    totalAmount: number
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, eventsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/events?limit=5'),
          fetch('/api/admin/bookings?limit=5'),
        ])

        const [adminStats, eventsData, bookingsData] = await Promise.all([
          statsRes.ok ? statsRes.json() : {},
          eventsRes.ok ? eventsRes.json() : { events: [] },
          bookingsRes.ok ? bookingsRes.json() : { bookings: [] },
        ])

        const dashboardStats: DashboardStats = {
          totalEvents: adminStats.totalEvents || 0,
          activeEvents: adminStats.activeEvents || 0,
          totalBookings: adminStats.totalBookings || 0,
          totalCustomers: adminStats.totalCustomers || 0,
          totalRevenue: adminStats.totalRevenue || 0,
          recentEvents: eventsData.events?.slice(0, 5) || [],
          recentBookings: bookingsData.bookings?.slice(0, 5) || [],
        }

        setStats(dashboardStats)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Administración
          </h1>
          <p className="text-gray-600">Resumen de tu plataforma de eventos</p>
        </div>
        <Button onClick={() => router.push('/admin/events/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalEvents || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.activeEvents || 0} activos
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservas</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalBookings || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Este mes
                </p>
              </div>
              <Ticket className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.totalCustomers || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Únicos registrados
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatPrice(stats?.totalRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total generado
                </p>
              </div>
              <Euro className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Eventos Recientes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/events')}>
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentEvents && stats.recentEvents.length > 0 ? (
              <div className="space-y-4">
                {stats.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(event.date))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {event.bookedTickets || 0}/{event.capacity}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        event.status === 'active' ? 'bg-green-100 text-green-800' :
                        event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        event.status === 'soldout' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status === 'active' ? 'Activo' :
                         event.status === 'draft' ? 'Borrador' :
                         event.status === 'soldout' ? 'Agotado' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
                <p className="text-gray-600 mb-4">Crea tu primer evento para empezar</p>
                <Button onClick={() => router.push('/admin/events/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Evento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Actividad Reciente</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/bookings')}>
              Ver todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{booking.customerName}</h4>
                      <p className="text-sm text-gray-500">{booking.eventTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(booking.totalAmount)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin actividad</h3>
                <p className="text-gray-600">
                  Las reservas aparecerán aquí cuando los clientes compren tickets
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => router.push('/admin/events/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Evento
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/events')}>
              <Calendar className="w-4 h-4 mr-2" />
              Ver Eventos
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/bookings')}>
              <Ticket className="w-4 h-4 mr-2" />
              Reservas
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/customers')}>
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}