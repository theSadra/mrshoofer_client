// Comprehensive test to diagnose 403 errors on ORS endpoints
// Run with: node diagnose-ors-403.js

const API_BASE = "https://mrshoofer-client.liara.run"; // Production
// const API_BASE = "http://localhost:3000"; // Local

const ORS_TOKEN = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

async function diagnose403() {
  console.log("🔍 Diagnosing ORS 403 Errors\n");
  console.log(`Testing against: ${API_BASE}\n`);
  console.log("=" .repeat(60) + "\n");
  
  // Test 1: Debug endpoint (no auth required)
  console.log("1️⃣ Testing /ORS/api/debug (should work without auth):");
  try {
    const res1 = await fetch(`${API_BASE}/ORS/api/debug`, {
      method: "GET",
    });
    console.log(`   Status: ${res1.status} ${res1.statusText}`);
    if (res1.status === 403) {
      console.log("   ❌ GOT 403 - Middleware is blocking ORS routes!");
      const text = await res1.text();
      console.log(`   Response: ${text.substring(0, 200)}...`);
    } else if (res1.ok) {
      const data1 = await res1.json();
      console.log(`   ✅ Success! Middleware is bypassed.`);
      console.log(`   Environment: ${data1.environment?.NODE_ENV}`);
      console.log(`   Has ORS Secret: ${data1.environment?.hasOrsSecret}`);
    } else {
      console.log(`   ⚠️ Unexpected status: ${res1.status}`);
      const text = await res1.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
    }
  } catch (err) {
    console.error("   ❌ Error:", err.message);
  }
  
  console.log("\n" + "=" .repeat(60) + "\n");
  
  // Test 2: Test endpoint with auth
  console.log("2️⃣ Testing /ORS/api/test (with auth):");
  try {
    const res2 = await fetch(`${API_BASE}/ORS/api/test`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
      },
    });
    console.log(`   Status: ${res2.status} ${res2.statusText}`);
    if (res2.status === 403) {
      console.log("   ❌ GOT 403 - ORS routes are being blocked!");
      const text = await res2.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
    } else if (res2.ok) {
      const data2 = await res2.json();
      console.log(`   ✅ Success!`);
      console.log(`   Message: ${data2.message}`);
      console.log(`   Has ORS Secret: ${data2.hasOrsSecret}`);
    } else {
      console.log(`   ⚠️ Status ${res2.status}`);
      const data2 = await res2.json();
      console.log(`   Response:`, JSON.stringify(data2, null, 2));
    }
  } catch (err) {
    console.error("   ❌ Error:", err.message);
  }
  
  console.log("\n" + "=" .repeat(60) + "\n");
  
  // Test 3: Register endpoint with auth
  console.log("3️⃣ Testing /ORS/api/register (with auth):");
  try {
    const res3 = await fetch(`${API_BASE}/ORS/api/register`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        NumberPhone: "09123456789",
        Firstname: "Test",
        Lastname: "User",
      }),
    });
    console.log(`   Status: ${res3.status} ${res3.statusText}`);
    if (res3.status === 403) {
      console.log("   ❌ GOT 403 - Register endpoint is blocked!");
      const text = await res3.text();
      console.log(`   Response: ${text.substring(0, 300)}`);
    } else if (res3.ok || res3.status === 201) {
      const data3 = await res3.json();
      console.log(`   ✅ Success!`);
      console.log(`   Message: ${data3.message || data3.messageEn}`);
      console.log(`   Is New: ${data3.isNew}`);
    } else {
      console.log(`   ⚠️ Status ${res3.status}`);
      const data3 = await res3.json();
      console.log(`   Response:`, JSON.stringify(data3, null, 2));
    }
  } catch (err) {
    console.error("   ❌ Error:", err.message);
  }
  
  console.log("\n" + "=" .repeat(60) + "\n");
  
  // Test 4: Different variations of ORS path (case sensitivity)
  console.log("4️⃣ Testing case variations:");
  const variations = [
    "/ORS/api/debug",
    "/ors/api/debug",
    "/Ors/api/debug",
    "/oRS/api/debug",
  ];
  
  for (const path of variations) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "GET" });
      console.log(`   ${path}: ${res.status} ${res.status === 403 ? "❌ BLOCKED" : res.ok ? "✅ OK" : "⚠️"}`);
    } catch (err) {
      console.log(`   ${path}: ❌ Error - ${err.message}`);
    }
  }
  
  console.log("\n" + "=" .repeat(60) + "\n");
  
  // Test 5: Check headers being sent
  console.log("5️⃣ Verifying request headers:");
  console.log(`   Authorization: Bearer ${ORS_TOKEN.substring(0, 20)}...`);
  console.log(`   Token length: ${ORS_TOKEN.length} characters`);
  console.log(`   Content-Type: application/json`);
  
  console.log("\n" + "=" .repeat(60) + "\n");
  
  // Summary
  console.log("📊 DIAGNOSIS SUMMARY:\n");
  console.log("If Test 1 returns 403:");
  console.log("  → The middleware is NOT bypassing ORS routes");
  console.log("  → Check middleware.ts config and matcher");
  console.log("  → Redeploy the application\n");
  
  console.log("If Test 1 succeeds but Tests 2-3 fail:");
  console.log("  → Middleware bypass works");
  console.log("  → Issue is with authentication");
  console.log("  → Check ORS_API_SECRET in production env\n");
  
  console.log("If all tests succeed:");
  console.log("  → Everything is working correctly!");
  console.log("  → The 403 error might be from a different cause\n");
  
  console.log("✅ Diagnosis completed!");
}

diagnose403().catch(console.error);
