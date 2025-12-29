const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkDatabase() {
  console.log('🔍 Checking database for existing data...\n');
  
  try {
    // Check each table
    const passengers = await prisma.passenger.count();
    const trips = await prisma.trip.count();
    const drivers = await prisma.driver.count();
    const users = await prisma.user.count();
    const locations = await prisma.location.count();
    
    console.log('📊 Database Status:');
    console.log('==================');
    console.log(`Passengers: ${passengers}`);
    console.log(`Trips: ${trips}`);
    console.log(`Drivers: ${drivers}`);
    console.log(`Users: ${users}`);
    console.log(`Locations: ${locations}`);
    console.log('==================\n');
    
    if (passengers === 0 && trips === 0 && drivers === 0 && users === 0) {
      console.log('❌ Database is EMPTY - all data was lost\n');
      console.log('💡 Possible recovery options:');
      console.log('   1. Check Liara console for automated backups');
      console.log('   2. Contact Liara support: https://liara.ir/support');
      console.log('   3. Check if you have a local backup or pg_dump file');
      console.log('   4. Ask team members if they have a local copy\n');
    } else {
      console.log('✅ Some data exists in the database!\n');
      
      // Show sample data
      if (passengers > 0) {
        const samplePassengers = await prisma.passenger.findMany({ take: 5 });
        console.log('Sample Passengers:', samplePassengers);
      }
      
      if (drivers > 0) {
        const sampleDrivers = await prisma.driver.findMany({ take: 5 });
        console.log('\nSample Drivers:', sampleDrivers);
      }
      
      if (users > 0) {
        const sampleUsers = await prisma.user.findMany({ 
          take: 5,
          select: { id: true, email: true, phoneNumber: true, isAdmin: true }
        });
        console.log('\nSample Users:', sampleUsers);
      }
    }
    
    // Check migration history
    console.log('\n🔄 Checking migration history...');
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 10
    `;
    console.log('Recent Migrations:', migrations);
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
