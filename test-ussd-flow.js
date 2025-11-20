require('dotenv').config();
const USSDService = require('./backend/services/ussd.service.v2');

async function testUSSDFlow() {
  const sessionId = 'TEST_SESSION_' + Date.now();
  const phoneNumber = '+255683859594';
  
  console.log('\n=== Testing USSD Flow ===\n');
  
  try {
    // Step 1: Initial dial
    console.log('Step 1: Initial dial');
    let response = await USSDService.handleUSSD(sessionId, '*384*34153#', phoneNumber, '');
    console.log('Response:', response);
    console.log('---\n');
    
    // Step 2: Enter PIN
    console.log('Step 2: Enter PIN (1111)');
    response = await USSDService.handleUSSD(sessionId, '*384*34153#', phoneNumber, '1111');
    console.log('Response:', response);
    console.log('---\n');
    
    // Step 3: Select option 2 (Paid Consultation)
    console.log('Step 3: Select option 2 (Paid Consultation)');
    response = await USSDService.handleUSSD(sessionId, '*384*34153#', phoneNumber, '1111*2');
    console.log('Response:', response);
    console.log('---\n');
    
    // Step 4: Select doctor 1
    console.log('Step 4: Select doctor 1');
    response = await USSDService.handleUSSD(sessionId, '*384*34153#', phoneNumber, '1111*2*1');
    console.log('Response:', response);
    console.log('---\n');
    
    // Step 5: Select Mobile Payment (option 1)
    console.log('Step 5: Select Mobile Payment');
    response = await USSDService.handleUSSD(sessionId, '*384*34153#', phoneNumber, '1111*2*1*1');
    console.log('Response:', response);
    console.log('---\n');
    
    console.log('=== Test Complete ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUSSDFlow();
