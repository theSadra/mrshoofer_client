// Test script for ORS register endpoint
// Run with: node test-ors-register.js

const API_BASE = "https://mrshoofer-client.liara.run"; // Production
// const API_BASE = "http://localhost:3000"; // Local

const ORS_TOKEN = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

async function testRegisterEndpoint() {
  console.log("🧪 Testing ORS Register API\n");
  
  // Test 1: Register a new passenger
  console.log("1️⃣ Registering a new passenger:");
  const testPassenger = {
    NumberPhone: "09123456789",
    Firstname: "احمد",
    Lastname: "محمدی",
    NaCode: "1234567890",
  };
  
  try {
    const res1 = await fetch(`${API_BASE}/ORS/api/register`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPassenger),
    });
    const data1 = await res1.json();
    console.log(`   Status: ${res1.status}`);
    console.log(`   Response:`, JSON.stringify(data1, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n");
  
  // Test 2: Try to register the same passenger again (should return existing)
  console.log("2️⃣ Re-registering same passenger (should return existing):");
  try {
    const res2 = await fetch(`${API_BASE}/ORS/api/register`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ORS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPassenger),
    });
    const data2 = await res2.json();
    console.log(`   Status: ${res2.status}`);
    console.log(`   Response:`, JSON.stringify(data2, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n");
  
  // Test 3: Check if passenger exists (GET request)
  console.log("3️⃣ Checking if passenger exists:");
  try {
    const res3 = await fetch(
      `${API_BASE}/ORS/api/register?phone=${testPassenger.NumberPhone}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${ORS_TOKEN}`,
        },
      }
    );
    const data3 = await res3.json();
    console.log(`   Status: ${res3.status}`);
    console.log(`   Response:`, JSON.stringify(data3, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n");
  
  // Test 4: Check for non-existent passenger
  console.log("4️⃣ Checking for non-existent passenger:");
  try {
    const res4 = await fetch(
      `${API_BASE}/ORS/api/register?phone=09999999999`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${ORS_TOKEN}`,
        },
      }
    );
    const data4 = await res4.json();
    console.log(`   Status: ${res4.status}`);
    console.log(`   Response:`, JSON.stringify(data4, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n");
  
  // Test 5: Test without authentication (should fail with 401)
  console.log("5️⃣ Testing without authentication:");
  try {
    const res5 = await fetch(`${API_BASE}/ORS/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPassenger),
    });
    const data5 = await res5.json();
    console.log(`   Status: ${res5.status}`);
    console.log(`   Response:`, JSON.stringify(data5, null, 2));
  } catch (err) {
    console.error("   Error:", err.message);
  }
  
  console.log("\n✅ Tests completed!");
}

testRegisterEndpoint().catch(console.error);
