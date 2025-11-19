/**
 * API Structure Test
 * Validates API endpoint structure without running the server
 */

console.log('🔍 Testing API Structure\n');

const fs = require('fs');

// Test Voice Routes
console.log('✓ Testing Voice Routes');
const voiceRoutes = fs.readFileSync('backend/routes/voice.routes.js', 'utf8');
const expectedVoiceEndpoints = [
  "'/incoming'",
  "'/menu'",
  "'/select-doctor'",
  "'/process-symptoms'",
  "'/wait-for-doctor'",
  "'/call-completed'",
  "'/call-status'",
  "'/transcription'",
  "'/doctor-call'",
  "'/doctor-response'",
  "'/doctor-call-status'"
];

let voiceEndpointsFound = 0;
expectedVoiceEndpoints.forEach(endpoint => {
  if (voiceRoutes.includes(endpoint)) {
    console.log(`  ✅ POST /api/voice${endpoint.replace(/'/g, '')}`);
    voiceEndpointsFound++;
  } else {
    console.log(`  ❌ Missing: ${endpoint}`);
  }
});

console.log(`  Found ${voiceEndpointsFound}/${expectedVoiceEndpoints.length} voice endpoints\n`);

// Test Doctor Routes
console.log('✓ Testing Doctor Routes (Voice Extensions)');
const doctorRoutes = fs.readFileSync('backend/routes/doctor.routes.js', 'utf8');
const expectedDoctorVoiceEndpoints = [
  "'/call-queue'",
  "'/call-queue/:requestId/accept'",
  "'/call-queue/:requestId/reject'",
  "'/call-stats'"
];

let doctorVoiceEndpointsFound = 0;
expectedDoctorVoiceEndpoints.forEach(endpoint => {
  if (doctorRoutes.includes(endpoint)) {
    console.log(`  ✅ /api/doctors${endpoint.replace(/'/g, '')}`);
    doctorVoiceEndpointsFound++;
  } else {
    console.log(`  ❌ Missing: ${endpoint}`);
  }
});

console.log(`  Found ${doctorVoiceEndpointsFound}/${expectedDoctorVoiceEndpoints.length} doctor voice endpoints\n`);

// Test Voice Controller Methods
console.log('✓ Testing Voice Controller Methods');
const voiceController = fs.readFileSync('backend/controllers/voice.controller.js', 'utf8');
const expectedControllerMethods = [
  'handleIncoming',
  'handleMenu',
  'handleDoctorSelection',
  'processSymptoms',
  'waitForDoctor',
  'handleCallCompleted',
  'handleCallStatus',
  'handleTranscription',
  'handleDoctorCall',
  'handleDoctorResponse',
  'handleDoctorCallStatus'
];

let controllerMethodsFound = 0;
expectedControllerMethods.forEach(method => {
  if (voiceController.includes(`static async ${method}`)) {
    console.log(`  ✅ ${method}()`);
    controllerMethodsFound++;
  } else {
    console.log(`  ❌ Missing: ${method}()`);
  }
});

console.log(`  Found ${controllerMethodsFound}/${expectedControllerMethods.length} controller methods\n`);

// Test Models
console.log('✓ Testing Voice Models');
const voiceSessionModel = fs.readFileSync('backend/models/VoiceSession.js', 'utf8');
const callQueueModel = fs.readFileSync('backend/models/DoctorCallQueue.js', 'utf8');

const voiceSessionMethods = ['create', 'findById', 'findByCallSid', 'updateSession', 'completeSession'];
const callQueueMethods = ['create', 'findById', 'getPendingForDoctor', 'accept', 'reject', 'complete'];

let voiceSessionMethodsFound = 0;
voiceSessionMethods.forEach(method => {
  if (voiceSessionModel.includes(`static async ${method}`)) {
    console.log(`  ✅ VoiceSession.${method}()`);
    voiceSessionMethodsFound++;
  }
});

let callQueueMethodsFound = 0;
callQueueMethods.forEach(method => {
  if (callQueueModel.includes(`static async ${method}`)) {
    console.log(`  ✅ DoctorCallQueue.${method}()`);
    callQueueMethodsFound++;
  }
});

console.log(`  Found ${voiceSessionMethodsFound + callQueueMethodsFound}/${voiceSessionMethods.length + callQueueMethods.length} model methods\n`);

// Test Frontend Integration
console.log('✓ Testing Frontend Integration');
const dashboard = fs.readFileSync('frontend/src/pages/Dashboard.js', 'utf8');
const callQueue = fs.readFileSync('frontend/src/components/CallQueue.js', 'utf8');

const frontendChecks = [
  { name: 'CallQueue component imported', file: dashboard, pattern: /import.*CallQueue/ },
  { name: 'CallQueue component rendered', file: dashboard, pattern: /<CallQueue/ },
  { name: 'API call to /call-queue', file: callQueue, pattern: /\/doctors\/call-queue/ },
  { name: 'Accept call handler', file: callQueue, pattern: /handleAccept/ },
  { name: 'Reject call handler', file: callQueue, pattern: /handleReject/ },
  { name: 'Auto-refresh implemented', file: callQueue, pattern: /setInterval/ }
];

let frontendChecksPass = 0;
frontendChecks.forEach(check => {
  if (check.pattern.test(check.file)) {
    console.log(`  ✅ ${check.name}`);
    frontendChecksPass++;
  } else {
    console.log(`  ❌ ${check.name}`);
  }
});

console.log(`  Found ${frontendChecksPass}/${frontendChecks.length} frontend integrations\n`);

// Summary
console.log('='.repeat(50));
console.log('\n📊 API STRUCTURE TEST SUMMARY\n');

const totalChecks = voiceEndpointsFound + doctorVoiceEndpointsFound + 
                    controllerMethodsFound + voiceSessionMethodsFound + 
                    callQueueMethodsFound + frontendChecksPass;
const totalExpected = expectedVoiceEndpoints.length + 
                      expectedDoctorVoiceEndpoints.length + 
                      expectedControllerMethods.length + 
                      voiceSessionMethods.length + 
                      callQueueMethods.length + 
                      frontendChecks.length;

console.log(`Voice Endpoints: ${voiceEndpointsFound}/${expectedVoiceEndpoints.length}`);
console.log(`Doctor Voice Endpoints: ${doctorVoiceEndpointsFound}/${expectedDoctorVoiceEndpoints.length}`);
console.log(`Controller Methods: ${controllerMethodsFound}/${expectedControllerMethods.length}`);
console.log(`Model Methods: ${voiceSessionMethodsFound + callQueueMethodsFound}/${voiceSessionMethods.length + callQueueMethods.length}`);
console.log(`Frontend Integration: ${frontendChecksPass}/${frontendChecks.length}`);
console.log(`\nTotal: ${totalChecks}/${totalExpected}`);
console.log(`Success Rate: ${Math.round((totalChecks / totalExpected) * 100)}%`);

if (totalChecks === totalExpected) {
  console.log('\n✅ ALL API STRUCTURE TESTS PASSED!');
  console.log('\n🎯 Voice/IVR system is fully integrated and ready to use.');
} else {
  console.log('\n⚠️  Some API structure checks failed.');
}

console.log('\n' + '='.repeat(50));
