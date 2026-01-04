// Detailed debugging for the trip endpoint specifically
const API_BASE = "https://mrshoofer-client.liara.run";
const ORS_TOKEN = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

async function debugTripEndpoint() {
  console.log("🔍 Debugging /ORS/api/trip endpoint\n");
  
  // Test 1: Check what headers we're sending
  console.log("1️⃣ Request details:");
  console.log(`   URL: ${API_BASE}/ORS/api/trip`);
  console.log(`   Token: ${ORS_TOKEN.substring(0, 20)}...`);
  console.log(`   Token Length: ${ORS_TOKEN.length}`);
  console.log("");
  
  // Test 2: Try POST with minimal data
  console.log("2️⃣ Testing POST with minimal data:");
  try {
    const response = await fetch(`${API_BASE}/ORS/api/trip`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passenger: {
          NumberPhone: "09123456789",
          Firstname: "Test",
          Lastname: "User"
        },
        trip: {
          TripCode: "TEST" + Date.now(),
          OriginCity: "Tehran",
          DestinationCity: "Mashhad",
          Origin_id: 1,
          Destination_id: 2,
          CarName: "Pride",
          ServiceName: "Economy",
          StartsAt: "2026-01-15T10:00:00",
          TicketCode: "T" + Date.now()
        }
      }),
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`);
    console.log(`     Content-Type: ${response.headers.get('content-type')}`);
    console.log(`     X-ORS-Bypass: ${response.headers.get('X-ORS-Bypass') || 'not set'}`);
    
    const text = await response.text();
    console.log(`   Response length: ${text.length} bytes`);
    console.log(`   Response preview: ${text.substring(0, 500)}`);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      console.log(`   Parsed JSON:`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`   Not JSON - likely HTML error page`);
      if (text.includes("<!DOCTYPE")) {
        console.log("   ⚠️  Received HTML page - this is a Next.js error page!");
        console.log("   This suggests the route file has an error or doesn't exist");
      }
    }
  } catch (err) {
    console.error("   ❌ Error:", err.message);
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 3: Try GET on trip endpoint (should fail, but let's see how)
  console.log("3️⃣ Testing GET (should fail gracefully):");
  try {
    const response = await fetch(`${API_BASE}/ORS/api/trip`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
      },
    });
    
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 200)}`);
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 4: Check if it's a deployment issue
  console.log("4️⃣ Testing other ORS endpoints for comparison:");
  
  const endpoints = [
    { path: "/ORS/api/test", method: "GET" },
    { path: "/ORS/api/debug", method: "GET" },
    { path: "/ORS/api/register?phone=09123456789", method: "GET" },
    { path: "/ORS/api/trip", method: "POST" },
  ];
  
  for (const ep of endpoints) {
    try {
      const opts = {
        method: ep.method,
        headers: { "Authorization": `Bearer ${ORS_TOKEN}` },
      };
      
      if (ep.method === "POST" && ep.path.includes("trip")) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify({
          passenger: { NumberPhone: "09123456789" },
          trip: { TripCode: "TEST" }
        });
      }
      
      const res = await fetch(`${API_BASE}${ep.path}`, opts);
      console.log(`   ${ep.method.padEnd(4)} ${ep.path.padEnd(40)} → ${res.status} ${res.status === 403 ? "❌" : "✅"}`);
    } catch (err) {
      console.log(`   ${ep.method.padEnd(4)} ${ep.path.padEnd(40)} → ERROR`);
    }
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
  console.log("💡 DIAGNOSIS:");
  console.log("If /ORS/api/trip returns 403 but others return 200:");
  console.log("  → The route file might have an error on production");
  console.log("  → Or the old version is still deployed");
  console.log("  → Check: app/ORS/api/trip/route.tsx on production");
  console.log("\nSuggested fix:");
  console.log("  1. Verify the trip route file is deployed");
  console.log("  2. Check production logs for errors");
  console.log("  3. Try redeploying specifically the trip route");
}

debugTripEndpoint().catch(console.error);
