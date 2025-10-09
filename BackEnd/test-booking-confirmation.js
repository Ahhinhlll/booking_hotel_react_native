const axios = require('axios');

const BASE_URL = 'http://localhost:3333/api';

// Test data
const testBookingData = {
  roomId: '02de6a16-5871-4c7d-a91c-0ee09f279c8e', // ID thực tế từ log
  hotelId: '6945a027-6f20-4892-b7e0-bd8afc6c5713', // ID thực tế từ log
  checkInDateTime: '2025-10-09T13:54:14.078Z',
  checkOutDateTime: '2025-10-09T17:54:14.078Z',
  bookingType: 'hourly',
  duration: 4,
  totalAmount: 450000,
  promotionId: null,
  bookerInfo: {
    phoneNumber: '+84 387238815',
    name: 'Joyer.651'
  },
  paymentMethod: 'momo',
  clientCalculatedTotalAmount: 450000
};

async function testBookingConfirmation() {
  try {
    console.log('🧪 Testing Booking Confirmation API...\n');

    // Test 1: Calculate Price
    console.log('1️⃣ Testing calculate price...');
    const calculateResponse = await axios.post(`${BASE_URL}/datphong/calculate-price`, {
      roomId: testBookingData.roomId,
      bookingType: testBookingData.bookingType,
      duration: testBookingData.duration,
      promotionId: testBookingData.promotionId
    });
    
    console.log('✅ Calculate Price Response:', calculateResponse.data);
    console.log('');

    // Test 2: Check Availability
    console.log('2️⃣ Testing check availability...');
    const availabilityResponse = await axios.get(`${BASE_URL}/datphong/check-availability`, {
      params: {
        roomId: testBookingData.roomId,
        checkInDateTime: testBookingData.checkInDateTime,
        checkOutDateTime: testBookingData.checkOutDateTime
      }
    });
    
    console.log('✅ Check Availability Response:', availabilityResponse.data);
    console.log('');

    // Test 3: Confirm Booking
    console.log('3️⃣ Testing confirm booking...');
    const confirmResponse = await axios.post(`${BASE_URL}/datphong/confirm`, testBookingData);
    
    console.log('✅ Confirm Booking Response:', confirmResponse.data);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test individual payment methods
async function testPaymentMethods() {
  const paymentMethods = ['momo', 'zalopay', 'shopeepay', 'credit', 'atm', 'hotel'];
  
  console.log('💳 Testing different payment methods...\n');
  
  for (const method of paymentMethods) {
    try {
      console.log(`Testing ${method}...`);
      const testData = { ...testBookingData, paymentMethod: method };
      
      const response = await axios.post(`${BASE_URL}/datphong/confirm`, testData);
      console.log(`✅ ${method}:`, response.data.message);
      
    } catch (error) {
      console.log(`❌ ${method}:`, error.response?.data?.message || error.message);
    }
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Booking Confirmation Tests\n');
  
  testBookingConfirmation()
    .then(() => {
      console.log('\n' + '='.repeat(50));
      return testPaymentMethods();
    })
    .then(() => {
      console.log('\n✨ All tests completed!');
    })
    .catch((error) => {
      console.error('💥 Test suite failed:', error.message);
    });
}

module.exports = {
  testBookingConfirmation,
  testPaymentMethods
};
