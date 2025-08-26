const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Recreando eventos de prueba...')
  
  const events = [
    {
      title: "Mystery Night - Detective Privado",
      description: "¿Estás listo para adentrarte en una experiencia única de misterio? Un detective privado muy conocido ha sido asesinado en su oficina. Los invitados deberán descubrir quién es el asesino entre ellos.",
      category: "murder",
      imageUrl: "/uploads/events/mystery-detective.jpg",
      date: new Date("2025-03-15"),
      time: "19:30",
      duration: 120,
      location: "Poble Espanyol, Barcelona",
      capacity: 30,
      availableTickets: 30,
      price: 35.00,
      minTickets: 2,
      maxTickets: 8,
      status: "active"
    },
    {
      title: "El Caso del Heredero Perdido",
      description: "Una mansión misteriosa, una herencia millonaria y un heredero desaparecido. Los invitados deberán resolver el enigma antes de la medianoche.",
      category: "detective",
      imageUrl: "/uploads/events/heredero-perdido.jpg",
      date: new Date("2025-03-22"),
      time: "20:00",
      duration: 150,
      location: "Casa Batlló, Barcelona",
      capacity: 25,
      availableTickets: 25,
      price: 45.00,
      minTickets: 2,
      maxTickets: 6,
      status: "active"
    },
    {
      title: "Escape Room: El Secreto del Conde",
      description: "60 minutos para escapar de las mazmorras del castillo del Conde. Trabaja en equipo y resuelve los acertijos antes de que sea demasiado tarde.",
      category: "escape",
      imageUrl: "/uploads/events/escape-conde.jpg",
      date: new Date("2025-04-05"),
      time: "18:00",
      duration: 90,
      location: "Castillo de Montjuïc, Barcelona",
      capacity: 20,
      availableTickets: 20,
      price: 30.00,
      minTickets: 3,
      maxTickets: 10,
      status: "active"
    }
  ]

  for (const eventData of events) {
    try {
      const event = await prisma.event.create({
        data: eventData
      })
      console.log(`✅ Evento creado: ${event.title}`)
    } catch (error) {
      console.error(`❌ Error creando evento: ${error.message}`)
    }
  }

  console.log('\n✨ Eventos recreados exitosamente!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })