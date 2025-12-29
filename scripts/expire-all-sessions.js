const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function expireAllSessions() {
  console.log('🔄 Expiring all existing sessions and tokens...\n');
  
  try {
    // Count existing sessions
    const sessionCount = await prisma.session.count();
    console.log(`📊 Found ${sessionCount} active sessions`);
    
    // Delete all sessions
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ Deleted ${deletedSessions.count} sessions`);
    
    // Count existing accounts (OAuth tokens)
    const accountCount = await prisma.account.count();
    console.log(`📊 Found ${accountCount} OAuth accounts`);
    
    if (accountCount > 0) {
      // Delete all OAuth accounts/tokens
      const deletedAccounts = await prisma.account.deleteMany({});
      console.log(`✅ Deleted ${deletedAccounts.count} OAuth accounts`);
    }
    
    // Delete verification tokens
    const verificationCount = await prisma.verificationToken.count();
    console.log(`📊 Found ${verificationCount} verification tokens`);
    
    if (verificationCount > 0) {
      const deletedTokens = await prisma.verificationToken.deleteMany({});
      console.log(`✅ Deleted ${deletedTokens.count} verification tokens`);
    }
    
    // Clear admin OTP codes
    const otpCount = await prisma.adminOtp.count();
    console.log(`📊 Found ${otpCount} OTP records`);
    
    if (otpCount > 0) {
      const deletedOtps = await prisma.adminOtp.deleteMany({});
      console.log(`✅ Deleted ${deletedOtps.count} OTP records`);
    }
    
    console.log('\n✅ ALL SESSIONS AND TOKENS EXPIRED!\n');
    console.log('🔐 Security Status:');
    console.log('==================');
    console.log('✓ All previous login sessions invalidated');
    console.log('✓ All OAuth tokens removed');
    console.log('✓ All verification tokens cleared');
    console.log('✓ All OTP codes expired');
    console.log('==================\n');
    console.log('⚠️  ALL USERS MUST LOG IN AGAIN');
    console.log('🌐 Login at: https://webapp.mrshoofer.ir/manage/login\n');
    
  } catch (error) {
    console.error('❌ Error expiring sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

expireAllSessions();
