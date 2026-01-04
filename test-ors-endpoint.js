// Test script to verify ORS endpoint token authentication
// Run with: node test-ors-endpoint.js

const API_BASE = "https://mrshoofer-client.liara.run"; // Production
// const API_BASE = "http://localhost:3000"; // Local

const ORS_TOKEN = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

async function testORS() {
  console.log("🧪 Testing ORS API Endpoints\n");
  
  // Test 1: Test endpoint without auth (should fail with 401)
  console.log("1️⃣ Testing without auth header:");
  try {
    const res1 = await fetch(`${API_BASE}/ORS/api/test`, {
      method: "GET",
    });
    const data1 = await res1.json();
    console.log(`   Status: ${res1.status}`);
    console.log(`   Response:`, JSON.stringify(data1, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n");
  
  // Test 2: Test endpoint with auth (should succeed)
  console.log("2️⃣ Testing with auth header:");
  try {
    const res2 = await fetch(`${API_BASE}/ORS/api/test`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
      },
    });
    const data2 = await res2.json();
    console.log(`   Status: ${res2.status}`);
    console.log(`   Response:`, JSON.stringify(data2, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n");
  
  // Test 3: Create trip with auth
  console.log("3️⃣ Testing trip creation:");
  const testTrip = {
    passenger: {
      NumberPhone: "09123456789",
      Firstname: "Test",
      Lastname: "User",
    },
    trip: {
      TripCode: "TEST123",
      Origin_id: 1,
      Destination_id: 2,
      OriginCity: "Tehran",
      DestinationCity: "Mashhad",
      CarName: "Pride",
      ServiceName: "Economy",
      StartsAt: "2026-01-15T10:30:00",
      TicketCode: `TEST${Date.now()}`,
    },
  };
  
  try {
    const res3 = await fetch(`${API_BASE}/ORS/api/trip`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testTrip),
    });
    const data3 = await res3.json();
    console.log(`   Status: ${res3.status}`);
    console.log(`   Response:`, JSON.stringify(data3, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n✅ Tests completed!");
}

testORS().catch(console.error);
