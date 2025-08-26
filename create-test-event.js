const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestEvent() {
  console.log('🎭 Creating test event for voucher redemption testing...')
  
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Create a test event
    const testEvent = {
      title: 'Mystery Night - Test Event',
      description: 'A thrilling mystery event for testing voucher redemption',
      category: 'murder',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '19:30',
      duration: 180, // 3 hours
      location: 'Test Theater, Madrid',
      capacity: 20,
      availableTickets: 20,
      price: 60.0,
      status: 'active'
    }

    const event = await prisma.event.create({
      data: testEvent
    })

    console.log('✅ Test event created successfully:')
    console.log(`   - ID: ${event.id}`)
    console.log(`   - Title: ${event.title}`)
    console.log(`   - Price: €${event.price}`)
    console.log(`   - Available tickets: ${event.availableTickets}`)
    console.log(`   - Status: ${event.status}`)
    console.log(`   - Date: ${event.date}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestEvent()
  .then(() => {
    console.log('🎉 Test event created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed:', error)
    process.exit(1)
  })