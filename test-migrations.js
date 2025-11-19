/**
 * Test script for auto-migration system
 * Run: node test-migrations.js
 */

require('dotenv').config();
const { runMigrations, getMigrationStatus } = require('./backend/config/migrations');
const { testConnection } = require('./backend/config/database');

async function testMigrations() {
  console.log('🧪 Testing Auto-Migration System\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Test database connection
    console.log('\n1️⃣  Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Step 2: Run migrations
    console.log('\n2️⃣  Running migrations...');
    const success = await runMigrations();
    
    if (!success) {
      console.error('❌ Migrations failed');
      process.exit(1);
    }

    // Step 3: Check migration status
    console.log('\n3️⃣  Checking migration status...');
    const status = await getMigrationStatus();
    
    console.log('\n📊 Database Status:');
    console.log('='.repeat(50));
    
    let totalTables = 0;
    let totalColumns = 0;
    
    for (const [table, info] of Object.entries(status)) {
      const icon = info.exists ? '✅' : '❌';
      console.log(`${icon} ${table.padEnd(20)} | Columns: ${info.columns}`);
      
      if (info.exists) {
        totalTables++;
        totalColumns += info.columns;
      }
    }
    
    console.log('='.repeat(50));
    console.log(`\n📈 Summary:`);
    console.log(`   Tables: ${totalTables}/${Object.keys(status).length}`);
    console.log(`   Total Columns: ${totalColumns}`);
    
    // Step 4: Verify critical tables
    console.log('\n4️⃣  Verifying critical tables...');
    const criticalTables = ['users', 'doctors', 'cases', 'transactions'];
    let allCriticalExist = true;
    
    for (const table of criticalTables) {
      if (!status[table] || !status[table].exists) {
        console.error(`❌ Critical table missing: ${table}`);
        allCriticalExist = false;
      }
    }
    
    if (allCriticalExist) {
      console.log('✅ All critical tables exist');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration test completed successfully!');
    console.log('='.repeat(50));
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testMigrations();
