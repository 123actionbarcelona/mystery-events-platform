const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createFreshMarinaVoucher() {
  console.log('🎁 Creating NEW unused €100 voucher for Marina López...')
  
  try {
    const voucher = await prisma.giftVoucher.create({
      data: {
        code: 'GIFT-MARI-UNUSED',
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
    
    console.log('✅ Fresh voucher created successfully!')
    console.log(`   Code: ${voucher.code}`)
    console.log(`   Purchaser: ${voucher.purchaserName}`)
    console.log(`   Original Amount: €${voucher.originalAmount}`)
    console.log(`   Current Balance: €${voucher.currentBalance}`)
    console.log(`   Status: ${voucher.status}`)
    
  } catch (error) {
    console.error('❌ Error creating voucher:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createFreshMarinaVoucher()