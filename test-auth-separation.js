// Test to verify ORS and Manage use DIFFERENT authentication systems
const API_BASE = "https://mrshoofer-client.liara.run";
const ORS_TOKEN = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

async function testAuthSeparation() {
  console.log("🔐 Testing Authentication System Separation\n");
  console.log("=" .repeat(70));
  console.log("SYSTEM 1: ORS API (Token-Based Auth)");
  console.log("SYSTEM 2: Manage/Admin (NextAuth Session-Based Auth)");
  console.log("=" .repeat(70) + "\n");
  
  // Test 1: ORS endpoint with ORS token (should work)
  console.log("1️⃣ ORS endpoint WITH ORS Bearer token:");
  try {
    const res1 = await fetch(`${API_BASE}/ORS/api/test`, {
      headers: { "Authorization": `Bearer ${ORS_TOKEN}` },
    });
    console.log(`   Status: ${res1.status} ${res1.status === 200 ? "✅" : "❌"}`);
    console.log(`   Auth-System: ${res1.headers.get('X-Auth-System') || 'not set'}`);
    console.log(`   ORS-Bypass: ${res1.headers.get('X-ORS-Bypass') || 'not set'}`);
    if (res1.ok) {
      const data = await res1.json();
      console.log(`   Response: ${data.message}`);
    }
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 2: ORS endpoint WITHOUT token (should fail with 401, NOT 403)
  console.log("2️⃣ ORS endpoint WITHOUT token (should return 401, not 403):");
  try {
    const res2 = await fetch(`${API_BASE}/ORS/api/test`);
    console.log(`   Status: ${res2.status}`);
    console.log(`   Expected: 401 (missing ORS token)`);
    console.log(`   Result: ${res2.status === 401 ? "✅ Correct" : res2.status === 403 ? "❌ NextAuth blocking!" : "⚠️ Unexpected"}`);
    const data = await res2.json();
    console.log(`   Error: ${data.error}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 3: Manage endpoint WITHOUT session (should redirect to login)
  console.log("3️⃣ Manage endpoint without NextAuth session:");
  try {
    const res3 = await fetch(`${API_BASE}/manage`, {
      redirect: 'manual' // Don't follow redirects
    });
    console.log(`   Status: ${res3.status}`);
    console.log(`   Expected: 307/308 redirect to /manage/login`);
    console.log(`   Location: ${res3.headers.get('location') || 'none'}`);
    console.log(`   Result: ${res3.status >= 307 && res3.status <= 308 ? "✅ NextAuth working" : "⚠️"}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 4: Try ORS token on Manage endpoint (should NOT work)
  console.log("4️⃣ Manage endpoint WITH ORS token (should NOT work):");
  try {
    const res4 = await fetch(`${API_BASE}/manage`, {
      headers: { "Authorization": `Bearer ${ORS_TOKEN}` },
      redirect: 'manual'
    });
    console.log(`   Status: ${res4.status}`);
    console.log(`   Expected: Still redirect (ORS token ignored by NextAuth)`);
    console.log(`   Result: ${res4.status >= 307 ? "✅ Correctly separated" : "❌ Auth systems mixed!"}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 5: ORS register endpoint (the one with issues)
  console.log("5️⃣ ORS register endpoint WITH ORS token:");
  try {
    const res5 = await fetch(`${API_BASE}/ORS/api/register?phone=09123456789`, {
      headers: { "Authorization": `Bearer ${ORS_TOKEN}` },
    });
    console.log(`   Status: ${res5.status}`);
    console.log(`   Auth-System: ${res5.headers.get('X-Auth-System') || 'not set'}`);
    console.log(`   Result: ${res5.status === 200 || res5.status === 404 ? "✅ Working" : "❌ Still blocked!"}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }
  
  console.log("\n" + "-".repeat(70) + "\n");
  
  // Test 6: ORS trip endpoint (the problematic one)
  console.log("6️⃣ ORS trip endpoint WITH ORS token:");
  try {
    const res6 = await fetch(`${API_BASE}/ORS/api/trip`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passenger: { NumberPhone: "09123456789" },
        trip: { TripCode: "TEST" }
      }),
    });
    console.log(`   Status: ${res6.status}`);
    console.log(`   Auth-System: ${res6.headers.get('X-Auth-System') || 'not set'}`);
    console.log(`   Result: ${res6.status === 400 || res6.status === 201 ? "✅ Working" : res6.status === 401 ? "⚠️ Token issue" : "❌ Still 403!"}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Summary
  console.log("📊 SUMMARY:\n");
  console.log("✅ CORRECT BEHAVIOR:");
  console.log("   • ORS routes return 401 when token is missing");
  console.log("   • ORS routes return 200/400/404 when token is valid");
  console.log("   • Manage routes redirect to /manage/login without session");
  console.log("   • ORS token does NOT work on Manage routes (separate systems)\n");
  
  console.log("❌ INCORRECT BEHAVIOR:");
  console.log("   • ORS routes return 403 (means NextAuth is interfering)");
  console.log("   • ORS routes work without X-Auth-System header (not bypassed)");
  console.log("   • Manage routes accept ORS token (systems mixed)\n");
  
  console.log("If Test 6 shows 403, the old code is still deployed!");
  console.log("Deploy now with: .\\quick-deploy.ps1\n");
}

testAuthSeparation().catch(console.error);
