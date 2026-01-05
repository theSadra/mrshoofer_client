// Test to reproduce the "works then 403" behavior
const API_BASE = "https://mrshoofer-client.liara.run";
const ORS_TOKEN = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

async function testRepeatedRequests() {
  console.log("🔄 Testing Repeated Requests to Find Rate Limiting\n");
  console.log("This will make multiple requests to /ORS/api/trip");
  console.log("to see if 403 starts appearing after some attempts.\n");
  console.log("=" .repeat(70) + "\n");
  
  const testData = {
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
  };
  
  let successCount = 0;
  let errorCount = 0;
  let first403 = null;
  
  for (let i = 1; i <= 20; i++) {
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE}/ORS/api/trip`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ORS_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": `ORS-Test-Client/${i}`,
        },
        body: JSON.stringify({
          ...testData,
          trip: {
            ...testData.trip,
            TripCode: `TEST${Date.now()}_${i}`,
            TicketCode: `T${Date.now()}_${i}`
          }
        }),
      });
      
      const duration = Date.now() - start;
      const status = response.status;
      
      if (status === 403) {
        if (!first403) first403 = i;
        errorCount++;
        console.log(`Request ${i.toString().padStart(2)}: ${status} ❌ (after ${duration}ms) - FIRST 403!`);
        
        // Get response details
        const text = await response.text();
        console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
        console.log(`   Body length: ${text.length}`);
        console.log(`   Body preview: ${text.substring(0, 100)}\n`);
        
        // Check for Liara WAF or rate limiting headers
        const retryAfter = response.headers.get('retry-after');
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        const wafHeader = response.headers.get('x-waf-blocked');
        
        if (retryAfter) console.log(`   Retry-After: ${retryAfter}`);
        if (rateLimitRemaining) console.log(`   Rate Limit Remaining: ${rateLimitRemaining}`);
        if (wafHeader) console.log(`   WAF Blocked: ${wafHeader}`);
        
      } else if (status === 200 || status === 201) {
        successCount++;
        console.log(`Request ${i.toString().padStart(2)}: ${status} ✅ (${duration}ms)`);
      } else {
        errorCount++;
        const data = await response.json().catch(() => ({}));
        console.log(`Request ${i.toString().padStart(2)}: ${status} ⚠️ (${duration}ms) - ${data.error || 'Unknown'}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      errorCount++;
      console.log(`Request ${i.toString().padStart(2)}: ERROR - ${err.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("\n📊 RESULTS:\n");
  console.log(`Total Requests: 20`);
  console.log(`Successful: ${successCount} ✅`);
  console.log(`Failed: ${errorCount} ❌`);
  
  if (first403) {
    console.log(`\n⚠️  First 403 appeared at request #${first403}`);
    console.log(`This suggests:`);
    console.log(`  1. Rate limiting after ${first403} requests`);
    console.log(`  2. Liara WAF detecting repeated POST requests`);
    console.log(`  3. IP-based throttling`);
    console.log(`  4. Security feature blocking "suspicious" activity`);
  } else {
    console.log(`\n✅ No 403 errors - issue may be intermittent or time-based`);
  }
  
  console.log("\n💡 SOLUTIONS:");
  console.log("  1. Add rate limiting exceptions for ORS routes in Liara");
  console.log("  2. Whitelist ORS IP addresses");
  console.log("  3. Configure Liara WAF to allow ORS endpoints");
  console.log("  4. Add proper request headers to identify as API client");
}

testRepeatedRequests().catch(console.error);
