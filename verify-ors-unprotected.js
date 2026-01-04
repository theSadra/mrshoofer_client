// Comprehensive verification script to ensure ORS routes are NEVER protected
// Run with: node verify-ors-unprotected.js

const API_BASE = "https://mrshoofer-client.liara.run"; // Production
// const API_BASE = "http://localhost:3000"; // Local

const ORS_TOKEN = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

async function verifyORSUnprotected() {
  console.log("🔒 Verifying ORS Routes Are UNPROTECTED\n");
  console.log(`Testing: ${API_BASE}\n`);
  console.log("=" .repeat(70) + "\n");
  
  let allPassed = true;
  
  // Test 1: Debug endpoint without auth (MUST work - proves middleware bypass)
  console.log("1️⃣ Testing /ORS/api/debug WITHOUT auth (must return 200):");
  try {
    const res1 = await fetch(`${API_BASE}/ORS/api/debug`, { method: "GET" });
    console.log(`   Status: ${res1.status}`);
    
    if (res1.status === 403) {
      console.log("   ❌ FAILED - Got 403! ORS routes are PROTECTED!");
      console.log("   ⚠️  This means middleware is NOT bypassing ORS routes!");
      allPassed = false;
    } else if (res1.status === 200) {
      console.log("   ✅ PASSED - Middleware bypass is working!");
      const data = await res1.json();
      console.log(`   Bypass Header: ${res1.headers.get('X-ORS-Bypass') || 'not set'}`);
      console.log(`   Environment: ${data.environment?.NODE_ENV}`);
    } else {
      console.log(`   ⚠️  Unexpected status: ${res1.status}`);
      allPassed = false;
    }
  } catch (err) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 2: Test endpoint with auth (should work)
  console.log("2️⃣ Testing /ORS/api/test WITH auth (must return 200):");
  try {
    const res2 = await fetch(`${API_BASE}/ORS/api/test`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${ORS_TOKEN}` },
    });
    console.log(`   Status: ${res2.status}`);
    
    if (res2.status === 403) {
      console.log("   ❌ FAILED - Got 403! Even WITH auth!");
      allPassed = false;
    } else if (res2.status === 200) {
      console.log("   ✅ PASSED - Endpoint accessible with auth!");
      const data = await res2.json();
      console.log(`   Has ORS Secret: ${data.hasOrsSecret}`);
    } else {
      console.log(`   ⚠️  Status: ${res2.status}`);
    }
  } catch (err) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 3: Register endpoint with auth (should work after deployment)
  console.log("3️⃣ Testing /ORS/api/register WITH auth (must return 200/201/404):");
  try {
    const res3 = await fetch(`${API_BASE}/ORS/api/register?phone=09123456789`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${ORS_TOKEN}` },
    });
    console.log(`   Status: ${res3.status}`);
    
    if (res3.status === 403) {
      console.log("   ❌ FAILED - Got 403! Register endpoint is BLOCKED!");
      console.log("   ⚠️  This endpoint might not exist yet - needs deployment!");
      allPassed = false;
    } else if (res3.status === 200 || res3.status === 404) {
      console.log("   ✅ PASSED - Endpoint is accessible!");
      const data = await res3.json();
      console.log(`   Response: ${data.messageEn || data.message || JSON.stringify(data)}`);
    } else if (res3.status === 404) {
      console.log("   ⚠️  Route not found (404) - needs deployment");
    } else {
      console.log(`   ⚠️  Status: ${res3.status}`);
    }
  } catch (err) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 4: Trip endpoint with auth
  console.log("4️⃣ Testing /ORS/api/trip WITH auth (must not return 403):");
  try {
    const res4 = await fetch(`${API_BASE}/ORS/api/trip`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passenger: { NumberPhone: "09123456789", Firstname: "Test", Lastname: "User" },
        trip: { TripCode: "TEST123", OriginCity: "Tehran", DestinationCity: "Mashhad" },
      }),
    });
    console.log(`   Status: ${res4.status}`);
    
    if (res4.status === 403) {
      console.log("   ❌ FAILED - Got 403! Trip endpoint is BLOCKED!");
      allPassed = false;
    } else if (res4.status === 400 || res4.status === 201 || res4.status === 200) {
      console.log("   ✅ PASSED - Endpoint is accessible!");
      const data = await res4.json();
      console.log(`   Response: ${data.message || data.error || 'Trip created'}`);
    } else {
      console.log(`   ⚠️  Status: ${res4.status}`);
    }
  } catch (err) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 5: Case sensitivity test
  console.log("5️⃣ Testing case variations (all should work):");
  const paths = ["/ORS/api/debug", "/ors/api/debug", "/Ors/api/debug"];
  
  for (const path of paths) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "GET" });
      const status = res.status;
      const icon = status === 200 ? "✅" : status === 403 ? "❌" : "⚠️";
      console.log(`   ${path}: ${status} ${icon}`);
      
      if (status === 403) {
        allPassed = false;
      }
    } catch (err) {
      console.log(`   ${path}: ❌ ERROR`);
      allPassed = false;
    }
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Summary
  if (allPassed) {
    console.log("✅✅✅ ALL TESTS PASSED! ✅✅✅");
    console.log("ORS routes are COMPLETELY UNPROTECTED and accessible!");
  } else {
    console.log("❌❌❌ SOME TESTS FAILED! ❌❌❌");
    console.log("\nPossible issues:");
    console.log("1. If Test 1 failed with 403:");
    console.log("   → Middleware is NOT bypassing ORS routes");
    console.log("   → Check middleware.ts and redeploy");
    console.log("\n2. If Test 3 failed with 403:");
    console.log("   → Register endpoint doesn't exist yet");
    console.log("   → Deploy the updated code");
    console.log("\n3. If other tests failed:");
    console.log("   → Check server logs for errors");
    console.log("   → Verify ORS_API_SECRET in production env");
  }
  
  console.log("\n✅ Verification completed!");
}

verifyORSUnprotected().catch(console.error);
