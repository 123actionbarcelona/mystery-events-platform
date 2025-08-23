# PROJECT.md - Mystery Events Platform

## 🎯 OBJETIVO DEL PROYECTO
Sistema completo de gestión de eventos de misterio con:
- Panel de administración para crear y gestionar eventos
- Página pública para que clientes compren tickets
- Pagos integrados con Stripe
- Emails automáticos con Gmail API
- Sincronización con Google Calendar
- Gestión automática de inventario de tickets

## 🛠️ STACK TECNOLÓGICO
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM (Supabase)
- **Autenticación**: NextAuth.js (admin) 
- **Pagos**: Stripe Checkout
- **Email**: Gmail API con OAuth2
- **Calendar**: Google Calendar API
- **Storage**: Supabase Storage (imágenes)
- **Hosting**: Vercel

## 📂 ESTRUCTURA DE CARPETAS
```
mystery-events/
├── app/
│   ├── (public)/           # Rutas públicas
│   │   ├── page.tsx        # Homepage
│   │   ├── events/         # Listado y detalle eventos
│   │   └── booking/        # Proceso reserva
│   ├── (admin)/            # Rutas admin protegidas
│   │   ├── dashboard/      # Panel principal
│   │   ├── events/         # Gestión eventos
│   │   ├── bookings/       # Gestión reservas
│   │   ├── customers/      # Base datos clientes
│   │   ├── templates/      # Plantillas email
│   │   └── settings/       # Configuración
│   └── api/
│       ├── auth/           # NextAuth
│       ├── events/         # CRUD eventos
│       ├── bookings/       # Gestión reservas
│       ├── stripe/         # Pagos
│       ├── email/          # Envío emails
│       ├── calendar/       # Google Calendar
│       └── cron/           # Tareas programadas
├── components/
│   ├── admin/              # Componentes admin
│   └── public/             # Componentes públicos
├── lib/                    # Utilidades
├── services/               # Lógica de negocio
├── prisma/                 # Schema DB
└── public/                 # Assets
```

## 🔄 ESTADO DEL PROYECTO

### ✅ Fase 1: Setup Inicial
- [ ] Crear proyecto Next.js 14 con TypeScript
- [ ] Instalar dependencias
- [ ] Configurar Tailwind CSS
- [ ] Crear estructura de carpetas
- [ ] Configurar variables de entorno

### 📊 Fase 2: Base de Datos
- [ ] Configurar Prisma
- [ ] Crear schema completo
- [ ] Conectar con Supabase
- [ ] Crear seed data

### 🔐 Fase 3: Autenticación Admin
- [ ] Configurar NextAuth
- [ ] Crear página login admin
- [ ] Middleware protección rutas
- [ ] Gestión de sesiones

### 👨‍💼 Fase 4: Panel Admin
- [ ] Dashboard con estadísticas
- [ ] CRUD de eventos
- [ ] Upload de imágenes
- [ ] Gestión de reservas
- [ ] Editor plantillas email

### 🌐 Fase 5: Página Pública
- [ ] Homepage
- [ ] Listado de eventos
- [ ] Detalle evento
- [ ] Proceso de reserva
- [ ] Página confirmación

### 🔌 Fase 6: Integraciones
- [ ] Gmail API setup
- [ ] Google Calendar sync
- [ ] Stripe checkout
- [ ] Stripe webhooks
- [ ] Supabase Storage

### ⚙️ Fase 7: Automatizaciones
- [ ] Emails confirmación
- [ ] Recordatorios 24h
- [ ] Actualización inventario
- [ ] Cron jobs

### 🎨 Fase 8: UI/UX
- [ ] Diseño responsive
- [ ] Loading states
- [ ] Error handling
- [ ] Animaciones

### 🧪 Fase 9: Testing
- [ ] Test flujo completo
- [ ] Test integraciones
- [ ] Test webhooks

### 🚀 Fase 10: Deploy
- [ ] Configurar Vercel
- [ ] Variables producción
- [ ] Dominio personalizado
- [ ] Monitoring

## 📝 REGLAS DE DESARROLLO
1. **TypeScript**: Tipar todo, interfaces para datos
2. **Validación**: Usar Zod en todas las APIs
3. **Errores**: Try-catch en todas las funciones async
4. **Responsive**: Mobile-first siempre
5. **Commits**: Un commit por componente/feature
6. **Comentarios**: En funciones complejas
7. **Testing**: Probar cada integración antes de continuar

## 🔑 VARIABLES DE ENTORNO
```env
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GMAIL_FROM_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
CRON_SECRET=
```

## 📌 NOTAS IMPORTANTES
- Admin email: admin@mysteryevents.com
- Timezone: Europe/Madrid
- Moneda: EUR
- Idioma: Español
- Categorías eventos: murder, escape, detective, horror