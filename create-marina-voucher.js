const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMarinaVoucher() {
  console.log('🎁 Creating voucher for Marina López...')
  
  try {
    const voucher = await prisma.giftVoucher.create({
      data: {
        code: 'GIFT-MARI-2025',
        type: 'amount',
        originalAmount: 100.0,
        currentBalance: 100.0,
        purchaserName: 'Marina López',
        purchaserEmail: 'marina.lopez@email.com',
        paymentStatus: 'completed',
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
        activatedAt: new Date(),
      }
    })
    
    console.log('✅ Voucher created successfully!')
    console.log(`   Code: ${voucher.code}`)
    console.log(`   Purchaser: ${voucher.purchaserName}`)
    console.log(`   Amount: €${voucher.currentBalance}`)
    
  } catch (error) {
    console.error('❌ Error creating voucher:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createMarinaVoucher()