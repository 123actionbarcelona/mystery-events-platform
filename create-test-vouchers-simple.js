const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestVouchers() {
  console.log('🎫 Creating test vouchers for development...')
  
  try {
    // Check if database is accessible
    console.log('🔍 Checking database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Check if gift_vouchers table exists
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='gift_vouchers'`
    console.log('📊 Tables found:', tables)

    // Create test vouchers
    const testVouchers = [
      {
        code: 'TEST-2025-AMOUNT',
        type: 'amount',
        originalAmount: 50.0,
        currentBalance: 50.0,
        purchaserName: 'Admin Test',
        purchaserEmail: 'admin@mysteryevents.com',
        paymentStatus: 'completed',
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        paidAt: new Date(),
        activatedAt: new Date(),
      },
      {
        code: 'TEST-2025-AMOUNT-LARGE',
        type: 'amount',
        originalAmount: 100.0,
        currentBalance: 100.0,
        purchaserName: 'Admin Test',
        purchaserEmail: 'admin@mysteryevents.com',
        paymentStatus: 'completed',
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
        activatedAt: new Date(),
      },
      {
        code: 'TEST-2025-PARTIAL',
        type: 'amount',
        originalAmount: 75.0,
        currentBalance: 25.0, // Parcialmente usado
        purchaserName: 'Admin Test',
        purchaserEmail: 'admin@mysteryevents.com',
        paymentStatus: 'completed',
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
        activatedAt: new Date(),
      }
    ]

    console.log('🚀 Creating vouchers...')
    
    for (const voucherData of testVouchers) {
      try {
        const voucher = await prisma.giftVoucher.create({
          data: voucherData
        })
        console.log(`✅ Created voucher: ${voucher.code} - €${voucher.currentBalance}`)
      } catch (error) {
        console.error(`❌ Error creating voucher ${voucherData.code}:`, error.message)
      }
    }

    console.log('📊 Current vouchers in database:')
    const allVouchers = await prisma.giftVoucher.findMany({
      select: {
        id: true,
        code: true,
        type: true,
        originalAmount: true,
        currentBalance: true,
        status: true
      }
    })
    
    console.table(allVouchers)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestVouchers()
  .then(() => {
    console.log('🎉 Test vouchers created successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed:', error)
    process.exit(1)
  })