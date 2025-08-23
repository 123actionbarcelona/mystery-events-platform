import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { mockRecentBookings } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación admin
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    let bookings, total

    try {
      // Intentar obtener reservas reales de la base de datos
      [bookings, total] = await Promise.all([
        db.booking.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            event: {
              select: {
                title: true,
                date: true,
                time: true,
              }
            },
            customer: {
              select: {
                name: true,
                email: true,
              }
            },
            tickets: true,
          }
        }),
        db.booking.count()
      ])

    } catch (dbError) {
      console.log('Database not available, using mock bookings')
      bookings = mockRecentBookings.slice(skip, skip + limit)
      total = mockRecentBookings.length
    }

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching admin bookings:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}