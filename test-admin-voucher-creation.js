// Test script to create voucher via admin API
const fetch = require('node-fetch');

async function testAdminVoucherCreation() {
  console.log('🧪 Testing admin voucher creation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/vouchers/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'amount',
        amount: 75,
        purchaserName: 'Admin Test User',
        purchaserEmail: 'admin@mysteryevents.com',
        template: 'elegant'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Voucher created successfully!');
      console.log('   Code:', data.voucher.code);
      console.log('   Purchaser:', data.voucher.purchaserName);
      console.log('   Amount:', data.voucher.originalAmount);
      console.log('   Status:', data.voucher.status);
    } else {
      console.log('❌ Error creating voucher:');
      console.log('   Status:', response.status);
      console.log('   Error:', data.error);
      if (data.details) {
        console.log('   Details:', JSON.stringify(data.details, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testAdminVoucherCreation();