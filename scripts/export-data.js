const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
  
  console.log('🔄 Exporting all data from database...\n');
  
  try {
    const data = {
      exportDate: new Date().toISOString(),
      passengers: await prisma.passenger.findMany({ include: { Locations: true, Trips: true } }),
      trips: await prisma.trip.findMany({ include: { Driver: true, Passenger: true, Location: true, OriginLocation: true, DestinationLocation: true } }),
      drivers: await prisma.driver.findMany({ include: { Trip: true } }),
      users: await prisma.user.findMany({ include: { accounts: true, sessions: true } }),
      locations: await prisma.location.findMany({ include: { Passenger: true } }),
    };
    
    console.log('📊 Data Summary:');
    console.log('==================');
    console.log(`Passengers: ${data.passengers.length}`);
    console.log(`Trips: ${data.trips.length}`);
    console.log(`Drivers: ${data.drivers.length}`);
    console.log(`Users: ${data.users.length}`);
    console.log(`Locations: ${data.locations.length}`);
    console.log('==================\n');
    
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Backup created successfully!`);
    console.log(`📁 Location: ${backupFile}`);
    console.log(`📊 Size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB\n`);
    
    // Create SQL INSERT statements for easy restore
    const sqlFile = path.join(backupDir, `backup-${timestamp}.sql`);
    let sql = '-- Database Backup SQL\n-- Generated: ' + new Date().toISOString() + '\n\n';
    
    // Export passengers
    if (data.passengers.length > 0) {
      sql += '-- Passengers\n';
      data.passengers.forEach(p => {
        sql += `INSERT INTO "Passenger" ("Firstname", "Lastname", "NumberPhone", "NaCode") VALUES ('${p.Firstname.replace(/'/g, "''")}', '${p.Lastname.replace(/'/g, "''")}', '${p.NumberPhone}', ${p.NaCode ? `'${p.NaCode}'` : 'NULL'}) ON CONFLICT ("NumberPhone") DO NOTHING;\n`;
      });
      sql += '\n';
    }
    
    // Export drivers
    if (data.drivers.length > 0) {
      sql += '-- Drivers\n';
      data.drivers.forEach(d => {
        sql += `INSERT INTO "Driver" ("Firstname", "Lastname", "PhoneNumber", "CarName") VALUES ('${d.Firstname.replace(/'/g, "''")}', '${d.Lastname.replace(/'/g, "''")}', '${d.PhoneNumber}', ${d.CarName ? `'${d.CarName.replace(/'/g, "''")}'` : 'NULL'});\n`;
      });
      sql += '\n';
    }
    
    fs.writeFileSync(sqlFile, sql, 'utf8');
    console.log(`✅ SQL backup also created!`);
    console.log(`📁 Location: ${sqlFile}\n`);
    
    console.log('💾 IMPORTANT: Copy these backup files to a safe location NOW!');
    console.log('   - OneDrive');
    console.log('   - External drive');
    console.log('   - Google Drive\n');
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
