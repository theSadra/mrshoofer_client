const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  console.log('👤 Creating superadmin user...\n');
  
  const phoneNumber = '09123036963';
  const name = 'ادمین اصلی';
  const password = 'd123456';
  
  try {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: phoneNumber },
          { email: phoneNumber }
        ]
      }
    });
    
    if (existing) {
      console.log('⚠️  User already exists. Updating to SuperAdmin...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name,
          password: hashedPassword,
          isAdmin: true,
          isSuperAdmin: true,
          phoneNumber: phoneNumber
        }
      });
      
      console.log('✅ SuperAdmin user updated successfully!\n');
      console.log('📋 Details:');
      console.log('==================');
      console.log(`Name: ${updated.name}`);
      console.log(`Phone: ${updated.phoneNumber}`);
      console.log(`Admin: ${updated.isAdmin}`);
      console.log(`SuperAdmin: ${updated.isSuperAdmin}`);
      console.log('==================\n');
      console.log('🔐 Login credentials:');
      console.log(`Username: ${phoneNumber}`);
      console.log(`Password: ${password}`);
      console.log('\n🌐 Login at: https://webapp.mrshoofer.ir/manage/login');
      
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new superadmin user
      const newUser = await prisma.user.create({
        data: {
          name: name,
          phoneNumber: phoneNumber,
          email: null,
          password: hashedPassword,
          isAdmin: true,
          isSuperAdmin: true
        }
      });
      
      console.log('✅ SuperAdmin user created successfully!\n');
      console.log('📋 Details:');
      console.log('==================');
      console.log(`ID: ${newUser.id}`);
      console.log(`Name: ${newUser.name}`);
      console.log(`Phone: ${newUser.phoneNumber}`);
      console.log(`Admin: ${newUser.isAdmin}`);
      console.log(`SuperAdmin: ${newUser.isSuperAdmin}`);
      console.log('==================\n');
      console.log('🔐 Login credentials:');
      console.log(`Username: ${phoneNumber}`);
      console.log(`Password: ${password}`);
      console.log('\n🌐 Login at: https://webapp.mrshoofer.ir/manage/login');
    }
    
    // Show total admin count
    const allUsers = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { name: true, phoneNumber: true, isAdmin: true, isSuperAdmin: true }
    });
    
    console.log(`\n📊 All admin users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.phoneNumber}) - ${user.isSuperAdmin ? 'SuperAdmin' : 'Admin'}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
