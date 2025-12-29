const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('👤 Creating admin user...\n');
  
  const phoneNumber = '09133387479';
  const name = 'ایمان همتیان';
  const password = 'h123456';
  
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
      console.log('⚠️  User already exists. Updating...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name,
          password: hashedPassword,
          isAdmin: true,
          isSuperAdmin: false,
          phoneNumber: phoneNumber
        }
      });
      
      console.log('✅ Admin user updated successfully!\n');
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
      
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          name: name,
          phoneNumber: phoneNumber,
          email: null,
          password: hashedPassword,
          isAdmin: true,
          isSuperAdmin: false
        }
      });
      
      console.log('✅ Admin user created successfully!\n');
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
    const adminCount = await prisma.user.count({
      where: { isAdmin: true }
    });
    
    console.log(`\n📊 Total admins in database: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
