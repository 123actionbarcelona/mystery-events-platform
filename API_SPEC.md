# API SPECIFICATION - Mystery Events

## 🔐 Autenticación
Todas las rutas `/api/admin/*` requieren autenticación via NextAuth

## 📍 Endpoints

### Events
```typescript
// GET /api/events
// Público - Listar eventos activos
Query params:
  - category?: string (murder|escape|detective|horror)
  - featured?: boolean
  - limit?: number
  - offset?: number
Response: Event[]

// GET /api/events/[id]
// Público - Detalle de evento
Response: Event

// POST /api/events
// Admin - Crear evento
Body: {
  title: string
  description: string
  category: string
  date: string (ISO)
  time: string (HH:mm)
  duration: number
  location: string
  capacity: number
  price: number
  imageUrl?: string
  syncCalendar?: boolean
}
Response: Event

// PUT /api/events/[id]
// Admin - Actualizar evento
Body: Partial<Event>
Response: Event

// DELETE /api/events/[id]
// Admin - Eliminar evento
Response: { success: boolean }
```

### Bookings
```typescript
// POST /api/bookings
// Público - Crear reserva
Body: {
  eventId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  quantity: number
}
Response: {
  bookingId: string
  checkoutUrl: string (Stripe)
}

// GET /api/bookings/[code]
// Público - Ver reserva por código
Response: Booking & { tickets: Ticket[] }

// GET /api/admin/bookings
// Admin - Listar todas las reservas
Query params:
  - eventId?: string
  - status?: string
  - limit?: number
  - offset?: number
Response: Booking[]

// PUT /api/admin/bookings/[id]/checkin
// Admin - Marcar check-in
Response: Booking
```

### Stripe
```typescript
// POST /api/stripe/checkout
// Crear sesión de checkout
Body: {
  bookingId: string
}
Response: {
  sessionId: string
  url: string
}

// POST /api/stripe/webhook
// Webhook de Stripe (llamado por Stripe)
Headers: {
  stripe-signature: string
}
Body: Stripe Event
Response: { received: boolean }

// POST /api/admin/bookings/[id]/refund
// Admin - Procesar reembolso
Response: {
  success: boolean
  refundId: string
}
```

### Email
```typescript
// POST /api/email/send
// Admin - Enviar email
Body: {
  to: string
  subject: string
  html: string
}
Response: { messageId: string }

// POST /api/email/send-template
// Sistema - Enviar con plantilla
Body: {
  to: string
  template: string
  variables: Record<string, any>
}
Response: { messageId: string }

// GET /api/admin/email/templates
// Admin - Listar plantillas
Response: EmailTemplate[]

// POST /api/admin/email/templates
// Admin - Crear plantilla
Body: {
  name: string
  subject: string
  html: string
  variables: string[]
}
Response: EmailTemplate

// PUT /api/admin/email/templates/[id]
// Admin - Actualizar plantilla
Body: Partial<EmailTemplate>
Response: EmailTemplate

// POST /api/admin/email/test
// Admin - Enviar email de prueba
Body: {
  to: string
  templateId: string
}
Response: { success: boolean }
```

### Calendar
```typescript
// POST /api/calendar/sync
// Admin - Sincronizar evento con Google Calendar
Body: {
  eventId: string
}
Response: {
  calendarEventId: string
  htmlLink: string
}

// PUT /api/calendar/update
// Sistema - Actualizar evento en calendar
Body: {
  calendarEventId: string
  updates: Partial<CalendarEvent>
}
Response: { success: boolean }

// POST /api/calendar/add-attendee
// Sistema - Añadir asistente
Body: {
  calendarEventId: string
  attendee: {
    email: string
    displayName: string
  }
}
Response: { success: boolean }
```

### Statistics
```typescript
// GET /api/admin/stats/dashboard
// Admin - Estadísticas del dashboard
Response: {
  totalEvents: number
  activeEvents: number
  totalBookings: number
  totalRevenue: number
  totalCustomers: number
  recentBookings: Booking[]
  upcomingEvents: Event[]
  salesChart: ChartData
}

// GET /api/admin/stats/events/[id]
// Admin - Estadísticas de evento específico
Response: {
  totalBookings: number
  totalRevenue: number
  occupancyRate: number
  customerList: Customer[]
}
```

### Cron Jobs
```typescript
// GET /api/cron/reminders
// Cron - Enviar recordatorios (llamado por Vercel Cron)
Headers: {
  authorization: Bearer ${CRON_SECRET}
}
Response: {
  success: boolean
  remindersCount: number
}

// GET /api/cron/cleanup
// Cron - Limpiar reservas pendientes viejas
Response: {
  success: boolean
  cleaned: number
}
```

## 🔒 Códigos de Error
```json
{
  "400": "Bad Request - Datos inválidos",
  "401": "Unauthorized - No autenticado",
  "403": "Forbidden - Sin permisos",
  "404": "Not Found - Recurso no encontrado",
  "409": "Conflict - Conflicto (ej: tickets agotados)",
  "429": "Too Many Requests - Rate limit",
  "500": "Internal Server Error"
}
```

## 📝 Validación con Zod
```typescript
// Ejemplo de schema de validación
const CreateEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.enum(['murder', 'escape', 'detective', 'horror']),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().min(30).max(480),
  location: z.string().min(5),
  capacity: z.number().min(1).max(500),
  price: z.number().min(0).max(1000)
});
```