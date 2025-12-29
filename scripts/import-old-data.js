const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importOldData() {
  console.log('🔄 Starting data import from September 22 backup...\n');
  
  // Read the backup file
  const backupFile = path.join(__dirname, '..', 'backups', 'sqlite-export-2025-12-29T13-33-19-085415.json');
  const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  const stats = {
    passengers: 0,
    drivers: 0,
    trips: 0,
    locations: 0,
    errors: []
  };
  
  try {
    // Import TripTickets as Trips
    console.log('📦 Importing TripTickets as Trips...');
    const tickets = data.tables.TripTickets || [];
    
    for (const ticket of tickets) {
      try {
        // First, create or find passenger
        let passenger = await prisma.passenger.findUnique({
          where: { NumberPhone: ticket.NumberPhone }
        });
        
        if (!passenger) {
          passenger = await prisma.passenger.create({
            data: {
              Firstname: ticket.FirstName || 'مسافر',
              Lastname: ticket.LastName || 'قدیمی',
              NumberPhone: ticket.NumberPhone,
              NaCode: ticket.NationalCode
            }
          });
          stats.passengers++;
        }
        
        // Create trip from ticket
        // Note: TripPlanId from old system doesn't directly map to new schema
        // We'll create a simplified trip record
        const trip = await prisma.trip.create({
          data: {
            TicketCode: ticket.TripTicketCode || `OLD-${ticket.ID}`,
            TripCode: `IMPORTED-${ticket.ID}`,
            Origin_id: 0, // Will need mapping
            Destination_id: 0, // Will need mapping
            OriginCity: 'تهران', // Default, update based on your data
            DestinationCity: 'مقصد', // Default
            CarName: 'خودرو', // Default
            ServiceName: ticket.IsPrivatePlan ? 'VIP' : 'اکو',
            StartsAt: new Date(ticket.RegisteredDateTime || Date.now()),
            passengerId: passenger.id,
            PassengerSmsSent: ticket.SurveyLinkSent === 1,
            AdminApproved: ticket.Status === 3, // Status 3 seems to be completed
            status: ticket.Status === 3 ? 'done' : 'canceled',
            SecureToken: `IMPORT-${ticket.ID}-${Date.now()}`
          }
        });
        
        stats.trips++;
        
        if (stats.trips % 100 === 0) {
          console.log(`  Imported ${stats.trips} trips...`);
        }
        
      } catch (err) {
        stats.errors.push(`Ticket ${ticket.ID}: ${err.message}`);
      }
    }
    
    console.log('\n✅ Import completed!\n');
    console.log('📊 Summary:');
    console.log('==================');
    console.log(`Passengers created: ${stats.passengers}`);
    console.log(`Trips imported: ${stats.trips}`);
    console.log(`Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️ First 10 errors:');
      stats.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    }
    
    // Show final counts
    const finalCounts = {
      passengers: await prisma.passenger.count(),
      trips: await prisma.trip.count(),
      drivers: await prisma.driver.count()
    };
    
    console.log('\n📈 Database totals:');
    console.log(`Total Passengers: ${finalCounts.passengers}`);
    console.log(`Total Trips: ${finalCounts.trips}`);
    console.log(`Total Drivers: ${finalCounts.drivers}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importOldData();
