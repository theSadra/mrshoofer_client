const fs = require('fs');
const path = require('path');

// Read the September 22 backup (largest one)
const backupFile = path.join(__dirname, '..', 'backups', 'sqlite-export-2025-12-29T13-33-19-085415.json');

console.log('🔍 Analyzing September 22 backup data...\n');

const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

console.log('📊 Tables Summary:');
console.log('==================\n');

Object.keys(data.tables).forEach(tableName => {
  const rows = data.tables[tableName];
  console.log(`${tableName}: ${rows.length} rows`);
  
  // Show sample data for key tables
  if (rows.length > 0 && ['Taxilocations', 'TaxiSupervisors', 'TripTickets', 'Passengers'].includes(tableName)) {
    console.log('  Sample row:', JSON.stringify(rows[0], null, 2).substring(0, 200) + '...');
  }
});

console.log('\n📋 Detailed Analysis:\n');

// Check Taxilocations (likely drivers)
if (data.tables.Taxilocations) {
  const drivers = data.tables.Taxilocations;
  console.log(`🚗 Taxilocations (Drivers): ${drivers.length} records`);
  
  if (drivers.length > 0) {
    console.log('\nFirst 5 drivers:');
    drivers.slice(0, 5).forEach((driver, idx) => {
      console.log(`\n${idx + 1}. ${JSON.stringify(driver, null, 2)}`);
    });
  }
}

// Check TaxiSupervisors
if (data.tables.TaxiSupervisors) {
  const supervisors = data.tables.TaxiSupervisors;
  console.log(`\n\n👔 TaxiSupervisors: ${supervisors.length} records`);
  
  if (supervisors.length > 0) {
    console.log('\nAll supervisors:');
    supervisors.forEach((sup, idx) => {
      console.log(`\n${idx + 1}. ${JSON.stringify(sup, null, 2)}`);
    });
  }
}

// Check TripTickets
if (data.tables.TripTickets) {
  const tickets = data.tables.TripTickets;
  console.log(`\n\n🎫 TripTickets: ${tickets.length} records`);
  console.log('First ticket sample:', JSON.stringify(tickets[0], null, 2));
}

console.log('\n\n✅ Analysis complete! This is your data from September 22, 2025');
