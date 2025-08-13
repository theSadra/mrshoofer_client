// Example usage of the Trip Location API
// File: example-api-usage.js

// Example 1: Get location for a trip
async function getTripLocation(tripId) {
    try {
        const response = await fetch(`/api/trip/${tripId}/location`);
        const result = await response.json();
        
        if (result.success) {
            console.log('Trip location:', result.location);
            return result.location;
        } else {
            console.error('Error:', result.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Example 2: Set/Update location for a trip
async function setTripLocation(tripId, locationData) {
    try {
        const response = await fetch(`/api/trip/${tripId}/location`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: locationData.lat,
                longitude: locationData.lng,
                textAddress: locationData.address,
                phoneNumber: locationData.phone,
                description: locationData.description
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Location updated:', result.location);
            console.log('Updated trip:', result.trip);
            return result;
        } else {
            console.error('Error:', result.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Example usage:
/*
// Get location
const location = await getTripLocation('your-secure-token-here');

// Set location
const result = await setTripLocation('your-secure-token-here', {
    lat: 35.6892,
    lng: 51.3890,
    address: 'خیابان آزادی، تهران',
    phone: '09123456789',
    description: 'نزدیک میدان آزادی'
});
*/
