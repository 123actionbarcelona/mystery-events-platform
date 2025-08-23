# ARQUITECTURA TÉCNICA - Mystery Events

## 🏗️ Arquitectura General
```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Frontend       │────▶│  API Routes     │
│  (Next.js)      │     │  (Next.js)      │
│                 │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
              │           │ │       │ │           │
              │ Database  │ │Stripe │ │  Google   │
              │ Supabase  │ │  API  │ │   APIs    │
              │           │ │       │ │           │
              └───────────┘ └───────┘ └───────────┘
```

## 📦 Dependencias Principales
```json
{
  "next": "14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "prisma": "^5.0.0",
  "next-auth": "^4.24.0",
  "stripe": "^14.0.0",
  "googleapis": "^128.0.0",
  "@supabase/supabase-js": "^2.38.0",
  "tailwindcss": "^3.3.0",
  "zod": "^3.22.0",
  "react-hot-toast": "^2.4.0",
  "react-hook-form": "^7.47.0",
  "@tiptap/react": "^2.1.0",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.292.0"
}
```

## 🗄️ Modelo de Datos (Prisma)
```prisma
Event {
  id, title, description, category, imageUrl,
  date, time, duration, location, capacity,
  availableTickets, price, status, googleCalendarId
}

Booking {
  id, bookingCode, eventId, customerName,
  customerEmail, customerPhone, quantity,
  totalAmount, paymentStatus, stripeSessionId
}

Ticket {
  id, ticketCode, bookingId, status, usedAt
}

Customer {
  id, email, name, phone, totalBookings, totalSpent
}

EmailTemplate {
  id, name, subject, html, variables, active
}

AdminUser {
  id, email, password, name, role
}
```

## 🔐 Autenticación y Autorización
- **Admin**: NextAuth con credenciales (email/password)
- **Clientes**: No requieren cuenta (checkout como invitado)
- **Middleware**: Protección de rutas /admin/*
- **Sesiones**: JWT con duración 30 días

## 🌐 API Routes Estructura
```
/api/auth/[...nextauth] - Autenticación admin
/api/events
  GET    - Listar eventos (público)
  POST   - Crear evento (admin)
  PUT    - Actualizar evento (admin)
  DELETE - Eliminar evento (admin)
/api/bookings
  POST   - Crear reserva y checkout
  GET    - Obtener reserva por código
/api/stripe
  /checkout - Crear sesión de pago
  /webhook  - Confirmar pago
/api/email
  /send     - Enviar email
  /templates - CRUD plantillas
/api/calendar
  /sync     - Sincronizar evento
  /update   - Actualizar asistentes
/api/cron
  /reminders - Enviar recordatorios diarios
```

## 📧 Sistema de Emails
```typescript
// Flujo de emails
1. Confirmación inmediata al pagar
2. Recordatorio 24h antes del evento
3. Email post-evento (feedback)
4. Cancelación si aplica

// Plantillas disponibles
- booking_confirmation
- booking_reminder  
- booking_cancelled
- waitlist_available
```

## 💳 Flujo de Pagos (Stripe)
```
1. Cliente selecciona tickets
2. Se crea sesión Stripe Checkout
3. Cliente paga en Stripe
4. Webhook confirma pago
5. Se actualiza DB y envía confirmación
6. Se sincroniza con Calendar
```

## 📅 Integración Google Calendar
```typescript
// Acciones automáticas
- Crear evento al publicar
- Añadir asistentes al confirmar pago
- Actualizar cuando hay cambios
- Eliminar si se cancela
```

## 🔄 Estados y Flujos

### Estados de Evento
- `draft`: Borrador, no visible
- `active`: Publicado y disponible
- `soldout`: Agotado
- `cancelled`: Cancelado

### Estados de Reserva
- `pending`: Esperando pago
- `completed`: Pagado
- `failed`: Pago fallido
- `refunded`: Reembolsado

### Estados de Ticket
- `valid`: Válido para usar
- `used`: Ya usado
- `cancelled`: Cancelado

## 🎨 Principios de UI/UX
- **Admin**: Interfaz clara, profesional, datos first
- **Público**: Inmersivo, misterioso, visual
- **Mobile First**: Todo responsive
- **Accesibilidad**: ARIA labels, navegación teclado
- **Performance**: Lazy loading, optimización imágenes

## 🚀 Configuración de Deploy
```yaml
Platform: Vercel
Database: Supabase
Crons: Vercel Cron
Storage: Supabase Storage
Domain: Custom domain
SSL: Automático
```

## 🔒 Seguridad
- Rate limiting en APIs (100 req/min)
- Validación con Zod
- Sanitización de inputs
- CORS configurado
- Headers de seguridad (CSP, HSTS)
- Secrets en variables de entorno
- SQL injection prevention (Prisma)