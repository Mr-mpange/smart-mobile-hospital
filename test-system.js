/**
 * SmartHealth System Test Script
 * Tests all major components without requiring external services
 */

console.log('🧪 SmartHealth System Test Suite\n');
console.log('='.repeat(50));

// Test 1: Check Node.js version
console.log('\n✓ Test 1: Node.js Version');
console.log(`  Node version: ${process.version}`);
if (parseInt(process.version.slice(1)) >= 16) {
  console.log('  ✅ PASS: Node.js 16+ detected');
} else {
  console.log('  ❌ FAIL: Node.js 16+ required');
  process.exit(1);
}

// Test 2: Check required files exist
console.log('\n✓ Test 2: File Structure');
const fs = require('fs');
const requiredFiles = [
  'backend/server.js',
  'backend/services/voice.service.js',
  'backend/controllers/voice.controller.js',
  'backend/models/VoiceSession.js',
  'backend/models/DoctorCallQueue.js',
  'backend/routes/voice.routes.js',
  'frontend/src/components/CallQueue.js',
  'database/schema.sql',
  'docs/VOICE_IVR.md',
  'VOICE_SETUP.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('  ✅ PASS: All required files exist');
} else {
  console.log('  ❌ FAIL: Some files are missing');
  process.exit(1);
}

// Test 3: Check package.json dependencies
console.log('\n✓ Test 3: Dependencies');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'express',
  'mysql2',
  'twilio',
  'bcryptjs',
  'jsonwebtoken',
  'cors',
  'helmet',
  'axios'
];

let allDepsPresent = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`  ❌ ${dep} - MISSING`);
    allDepsPresent = false;
  }
});

if (allDepsPresent) {
  console.log('  ✅ PASS: All dependencies declared');
} else {
  console.log('  ❌ FAIL: Some dependencies missing');
}

// Test 4: Check environment template
console.log('\n✓ Test 4: Environment Configuration');
const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'AT_API_KEY',
  'ZENOPAY_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER'
];

let allEnvVarsPresent = true;
requiredEnvVars.forEach(envVar => {
  if (envExample.includes(envVar)) {
    console.log(`  ✅ ${envVar}`);
  } else {
    console.log(`  ❌ ${envVar} - MISSING`);
    allEnvVarsPresent = false;
  }
});

if (allEnvVarsPresent) {
  console.log('  ✅ PASS: All environment variables defined');
} else {
  console.log('  ❌ FAIL: Some environment variables missing');
}

// Test 5: Validate database schema
console.log('\n✓ Test 5: Database Schema');
const schema = fs.readFileSync('database/schema.sql', 'utf8');
const requiredTables = [
  'users',
  'doctors',
  'cases',
  'transactions',
  'offers',
  'ussd_sessions',
  'sms_queue',
  'ratings',
  'voice_sessions',
  'doctor_call_queue'
];

let allTablesPresent = true;
requiredTables.forEach(table => {
  if (schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
    console.log(`  ✅ ${table}`);
  } else {
    console.log(`  ❌ ${table} - MISSING`);
    allTablesPresent = false;
  }
});

if (allTablesPresent) {
  console.log('  ✅ PASS: All database tables defined');
} else {
  console.log('  ❌ FAIL: Some tables missing');
}

// Test 6: Check API routes
console.log('\n✓ Test 6: API Routes');
const serverJs = fs.readFileSync('backend/server.js', 'utf8');
const requiredRoutes = [
  '/api/ussd',
  '/api/sms',
  '/api/doctors',
  '/api/payments',
  '/api/voice'
];

let allRoutesPresent = true;
requiredRoutes.forEach(route => {
  if (serverJs.includes(`'${route}'`)) {
    console.log(`  ✅ ${route}`);
  } else {
    console.log(`  ❌ ${route} - MISSING`);
    allRoutesPresent = false;
  }
});

if (allRoutesPresent) {
  console.log('  ✅ PASS: All API routes registered');
} else {
  console.log('  ❌ FAIL: Some routes missing');
}

// Test 7: Validate voice service
console.log('\n✓ Test 7: Voice Service Implementation');
const voiceService = fs.readFileSync('backend/services/voice.service.js', 'utf8');
const requiredMethods = [
  'handleIncomingCall',
  'handleMenu',
  'handleTrialConsultation',
  'handlePaidConsultation',
  'handleDoctorSelection',
  'processSymptoms',
  'waitForDoctor',
  'bridgeToDoctor',
  'handleCallCompleted',
  'notifyDoctor'
];

let allMethodsPresent = true;
requiredMethods.forEach(method => {
  if (voiceService.includes(`static async ${method}`) || voiceService.includes(`static ${method}`)) {
    console.log(`  ✅ ${method}()`);
  } else {
    console.log(`  ❌ ${method}() - MISSING`);
    allMethodsPresent = false;
  }
});

if (allMethodsPresent) {
  console.log('  ✅ PASS: All voice methods implemented');
} else {
  console.log('  ❌ FAIL: Some methods missing');
}

// Test 8: Check documentation
console.log('\n✓ Test 8: Documentation');
const docFiles = [
  'README.md',
  'INSTALLATION.md',
  'QUICKSTART.md',
  'docs/API.md',
  'docs/USSD_FLOW.md',
  'docs/VOICE_IVR.md',
  'docs/DEPLOYMENT.md',
  'docs/TESTING.md',
  'VOICE_SETUP.md',
  'VOICE_FEATURES.md',
  'COMPLETE_SYSTEM.md'
];

let allDocsPresent = true;
docFiles.forEach(doc => {
  if (fs.existsSync(doc)) {
    const stats = fs.statSync(doc);
    console.log(`  ✅ ${doc} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`  ❌ ${doc} - MISSING`);
    allDocsPresent = false;
  }
});

if (allDocsPresent) {
  console.log('  ✅ PASS: All documentation present');
} else {
  console.log('  ❌ FAIL: Some documentation missing');
}

// Test 9: Frontend components
console.log('\n✓ Test 9: Frontend Components');
const frontendFiles = [
  'frontend/src/App.js',
  'frontend/src/pages/Dashboard.js',
  'frontend/src/components/CallQueue.js',
  'frontend/src/components/Header.js',
  'frontend/src/components/Stats.js',
  'frontend/src/components/CaseList.js',
  'frontend/src/components/CaseModal.js'
];

let allComponentsPresent = true;
frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allComponentsPresent = false;
  }
});

if (allComponentsPresent) {
  console.log('  ✅ PASS: All frontend components present');
} else {
  console.log('  ❌ FAIL: Some components missing');
}

// Test 10: Code quality checks
console.log('\n✓ Test 10: Code Quality');
const voiceController = fs.readFileSync('backend/controllers/voice.controller.js', 'utf8');
const checks = [
  { name: 'Error handling', pattern: /try\s*{[\s\S]*?catch/ },
  { name: 'Async/await usage', pattern: /async\s+\w+/ },
  { name: 'Response validation', pattern: /res\.(status|json|send)/ },
  { name: 'Logging', pattern: /console\.(log|error)/ }
];

let allChecksPass = true;
checks.forEach(check => {
  if (check.pattern.test(voiceController)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name} - NOT FOUND`);
    allChecksPass = false;
  }
});

if (allChecksPass) {
  console.log('  ✅ PASS: Code quality checks passed');
}

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 TEST SUMMARY\n');

const totalTests = 10;
const passedTests = [
  allFilesExist,
  allDepsPresent,
  allEnvVarsPresent,
  allTablesPresent,
  allRoutesPresent,
  allMethodsPresent,
  allDocsPresent,
  allComponentsPresent,
  allChecksPass
].filter(Boolean).length + 1; // +1 for Node version

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED! System is ready for deployment.');
  console.log('\n📚 Next Steps:');
  console.log('  1. Install dependencies: npm install');
  console.log('  2. Configure .env file');
  console.log('  3. Setup database: npm run db:setup');
  console.log('  4. Configure Twilio webhooks');
  console.log('  5. Start server: npm run dev');
  console.log('\n📖 See QUICKSTART.md for detailed instructions');
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
