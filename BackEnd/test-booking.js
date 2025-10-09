const axios = require('axios');

// Test booking API
async function testBooking() {
  const baseUrl = 'http://localhost:3000/api/bookings';
  
  try {
    console.log('🧪 Testing Booking API...\n');
    
    // Test 1: Test endpoint
    console.log('1. Testing test endpoint...');
    const testResponse = await axios.post(`${baseUrl}/test`, {
      roomId: 'test-room-id',
      hotelId: 'test-hotel-id'
    });
    console.log('✅ Test endpoint:', testResponse.data);
    
    // Test 2: Calculate price
    console.log('\n2. Testing calculate price...');
    try {
      const priceResponse = await axios.post(`${baseUrl}/calculate-price`, {
        roomId: 'test-room-id',
        bookingType: 'hourly',
        duration: 2,
        promotionId: null
      });
      console.log('✅ Calculate price:', priceResponse.data);
    } catch (error) {
      console.log('❌ Calculate price error:', error.response?.data || error.message);
    }
    
    // Test 3: Check availability
    console.log('\n3. Testing check availability...');
    try {
      const availabilityResponse = await axios.get(`${baseUrl}/check-availability`, {
        params: {
          roomId: 'test-room-id',
          checkInDateTime: new Date().toISOString(),
          checkOutDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      });
      console.log('✅ Check availability:', availabilityResponse.data);
    } catch (error) {
      console.log('❌ Check availability error:', error.response?.data || error.message);
    }
    
    // Test 4: Confirm booking (this will likely fail due to missing data)
    console.log('\n4. Testing confirm booking...');
    try {
      const bookingResponse = await axios.post(`${baseUrl}/confirm`, {
        roomId: 'test-room-id',
        hotelId: 'test-hotel-id',
        checkInDateTime: new Date().toISOString(),
        checkOutDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        bookingType: 'hourly',
        duration: 2,
        paymentMethod: 'hotel',
        clientCalculatedTotalAmount: 500000,
        promotionId: null
      });
      console.log('✅ Confirm booking:', bookingResponse.data);
    } catch (error) {
      console.log('❌ Confirm booking error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testBooking();

