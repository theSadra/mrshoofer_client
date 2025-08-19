"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Input} from "@heroui/react";
import { Textarea } from "@heroui/react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/react";
import { useTripContext } from "../../../contexts/TripContext";

// Custom CSS classes for enhanced animations
const customStyles = `
  @keyframes bounce-gentle {
    0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
    50% { transform: translate(-50%, -50%) translateY(-4px); }
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 3s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out forwards;
  }
  
  .animate-slide-in {
    animation: slide-in 0.4s ease-out forwards;
  }
  
  /* Custom scrollbar for drawer */
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  
  .custom-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 10px;
  }
  
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
  }
  
  /* User location marker animations */
  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.1);
      opacity: 0.9;
    }
  }
  
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

export const SearchIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);
const MAP_KEY =
  process.env.NEXT_PUBLIC_NESHAN_MAP_KEY ||
  "web.629d398efe5a4b3d90b9d032569935a6";
const API_KEY =

  process.env.NEXT_PUBLIC_NESHAN_API_KEY ||
  "service.6f5734c50a9c43cba6f43a6254c1b668";

function LocationSelectorPage({ tripId, tripData }) {
  const router = useRouter();
  const { tripData: contextTripData, setTripData, clearTripData } = useTripContext();
  const [mounted, setMounted] = useState(false);
  const [trip, setTrip] = useState(tripData || contextTripData || null);
  const [loading, setLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [zoom, setZoom] = useState(11);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showPicker, setShowPicker] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState("در حال بارگذاری آدرس...");
  const [numberPhone, setNumberPhone] = useState(tripData?.Passenger?.NumberPhone || contextTripData?.Passenger?.NumberPhone || "");
  const [description, setDescription] = useState(tripData?.Location?.Description || contextTripData?.Location?.Description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  // Real-time location tracking states
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const selectedMarkerRef = useRef(null);
  const lastMarkerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  // Real-time location tracking refs
  const accuracyCircleRef = useRef(null);
  const locationWatchIdRef = useRef(null);
  const currentLocationRef = useRef(null); // Store current location for zoom handler
  const selectedCordinates = useRef({ lat: 0, lng: 0 });
  const searchTimeoutRef = useRef(null);
  const currentSearchRef = useRef(null); // Track current search to prevent race conditions
  const isProgrammaticSearch = useRef(false); // Flag to prevent auto-search when setting programmatically
  const abortControllerRef = useRef(null); // For canceling previous requests

  // Define optimized searchNeshan with useCallback and request cancellation
  const searchNeshan = useCallback(async (query) => {
    // Early return checks - now requires minimum 3 characters
    if (!query || query.length < 3) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    if (typeof window === 'undefined' || !window.neshanMapInstance) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Prevent multiple simultaneous searches
    if (searchLoading) {
      return;
    }

    // Set current search and prevent race conditions
    currentSearchRef.current = query;
    console.log('Starting optimized search for:', query);
    setSearchLoading(true);

    try {
      // Add safety check for map instance readiness
      const mapInstance = window.neshanMapInstance;
      if (!mapInstance.getCenter || typeof mapInstance.getCenter !== 'function') {
        console.log('Map not ready for search - getCenter not available');
        setSearchLoading(false);
        return;
      }

      let center;
      try {
        center = mapInstance.getCenter();
      } catch (e) {
        console.log('Error getting map center:', e);
        // Use default Tehran coordinates as fallback
        center = { lat: 35.6892, lng: 51.389 };
      }

      if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
        console.log('Invalid map center coordinates, using default');
        center = { lat: 35.6892, lng: 51.389 };
      }

      const lat = center.lat;
      const lng = center.lng;
      const url = `https://api.neshan.org/v1/search?term=${encodeURIComponent(
        query
      )}&lat=${lat}&lng=${lng}`;
      
      console.log('Search URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Api-Key": API_KEY,
          "Content-Type": "application/json"
        },
        signal: abortControllerRef.current.signal // Add abort signal for request cancellation
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      // Only update state if this is still the current search (prevent race conditions)
      if (currentSearchRef.current === query) {
        const items = data.items || [];
        setResults(items);
        setShowDropdown(items.length > 0);
      }
      
    } catch (error) {
      // Handle aborted requests gracefully
      if (error.name === 'AbortError') {
        console.log('Search request aborted for:', query);
        return; // Don't update state for aborted requests
      }
      
      console.error('Error searching Neshan:', error);
      // Only update state if this is still the current search and not aborted
      if (currentSearchRef.current === query) {
        setResults([]);
        setShowDropdown(false);
      }
    } finally {
      // Only update loading state if this is still the current search and not aborted
      if (currentSearchRef.current === query) {
        setSearchLoading(false);
      }
    }
  }, []); // Remove searchLoading from dependencies to prevent infinite loop

  // Ensure component only renders on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search input to avoid excessive API calls with optimized timing
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Skip search if it was set programmatically (from selecting a search result)
    if (isProgrammaticSearch.current) {
      isProgrammaticSearch.current = false;
      console.log('Skipping search - programmatic input');
      return;
    }

    // Only proceed if search has actual content and is different from last search
    const trimmedSearch = search.trim();
    // Increased minimum length to 3 characters to reduce API calls
    if (trimmedSearch && trimmedSearch.length >= 3 && trimmedSearch !== currentSearchRef.current) {
      console.log('Scheduling search for:', trimmedSearch);
      
      // Dynamic debounce timing: longer for shorter queries, shorter for longer queries
      const debounceTime = trimmedSearch.length <= 4 ? 800 : trimmedSearch.length <= 6 ? 600 : 400;
      
      searchTimeoutRef.current = setTimeout(() => {
        // Double check that search hasn't changed
        if (search.trim() === trimmedSearch && !searchLoading) {
          searchNeshan(trimmedSearch);
        }
      }, debounceTime);
    } else if (!trimmedSearch || trimmedSearch.length < 3) {
      // Clear results immediately if search is empty or too short
      console.log('Clearing search results - empty or too short');
      currentSearchRef.current = null;
      setResults([]);
      setShowDropdown(false);
      setSearchLoading(false);
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [search, searchLoading]); // Include searchLoading to prevent scheduling while loading

  // ============= LOCATION TRACKING FUNCTIONS =============
  // Advanced location tracking functions
  const startLocationTracking = () => {
    console.log('=== STARTING REAL-TIME LOCATION TRACKING ===');
    
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      setLocationError('GPS not supported by this browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);
    setIsTrackingLocation(true);

    // High-precision geolocation options
    const watchOptions = {
      enableHighAccuracy: true,
      maximumAge: 0, // Always get fresh location
      timeout: 10000, // 10 seconds timeout
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('=== LOCATION UPDATE RECEIVED ===');
        console.log('Accuracy:', position.coords.accuracy, 'meters');
        console.log('Coordinates:', position.coords.latitude, position.coords.longitude);
        
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setUserLocation(newLocation);
        setLocationAccuracy(position.coords.accuracy);
        setIsLoadingLocation(false);
        setLocationError(null);

        // Store current location for zoom handler
        currentLocationRef.current = newLocation;

        // Update the location marker and accuracy circle
        updateLocationDisplay(newLocation);
      },
      (error) => {
        console.error('=== LOCATION ERROR ===', error);
        setIsLoadingLocation(false);
        
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timeout";
            break;
          default:
            errorMessage = "Unknown location error";
            break;
        }
        
        setLocationError(errorMessage);
      },
      watchOptions
    );

    locationWatchIdRef.current = watchId;
    console.log('Location tracking started with ID:', watchId);
  };

  const stopLocationTracking = () => {
    console.log('=== STOPPING LOCATION TRACKING ===');
    
    if (locationWatchIdRef.current) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
      console.log('Location tracking stopped');
    }
    
    setIsTrackingLocation(false);
    setIsLoadingLocation(false);
    
    // Remove accuracy circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }
    
    // Remove user location marker (now only DOM markers)
    if (userLocationMarkerRef.current) {
      try {
        userLocationMarkerRef.current.remove();
      } catch (error) {
        console.warn('Error removing user location marker:', error);
      }
      userLocationMarkerRef.current = null;
    }
  };

  const updateLocationDisplay = (location) => {
    console.log('=== UPDATING LOCATION DISPLAY ===');
    console.log('Location:', location);
    
    if (!window.neshanMapInstance) {
      console.warn('Map not ready for location display update');
      return;
    }

    const map = window.neshanMapInstance;

    // Use separate markers like the working search markers
    updateAccuracyCircle(location.lat, location.lng, location.accuracy);
    updateUserLocationMarker(location.lat, location.lng);
  };

  const updateAccuracyCircle = (lat, lng, accuracy) => {
    console.log('=== UPDATING ACCURACY CIRCLE ===');
    console.log('Input parameters:');
    console.log('- Latitude:', lat);
    console.log('- Longitude:', lng);
    console.log('- Accuracy:', accuracy, 'meters (type:', typeof accuracy, ')');
    
    // Validate accuracy value
    if (accuracy === null || accuracy === undefined || isNaN(accuracy)) {
      console.warn('Invalid accuracy value:', accuracy, '- using fallback of 50 meters');
      accuracy = 50;
    }
    
    if (accuracy <= 0) {
      console.warn('Non-positive accuracy value:', accuracy, '- using fallback of 50 meters');
      accuracy = 50;
    }
    
    // Clamp accuracy to reasonable bounds (5m to 500m)
    if (accuracy < 5) {
      console.warn('Unusually high accuracy:', accuracy, 'm - clamping to 5m minimum');
      accuracy = 5;
    }
    
    if (accuracy > 500) {
      console.warn('Unusually low accuracy:', accuracy, 'm - clamping to 500m maximum');
      accuracy = 500;
    }
    
    console.log('Final validated accuracy:', accuracy, 'meters');
    
    if (!window.neshanMapInstance) {
      console.warn('Map not ready for accuracy circle update');
      return;
    }
    
    const map = window.neshanMapInstance;
    
    // Remove existing accuracy circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }

    // Create accuracy circle element using EXACT pattern as working markers
    const circleEl = document.createElement("div");
    
    // Calculate circle size based on map zoom and accuracy
    const zoom = map.getZoom();
    const metersPerPixel = 40075000 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom + 8);
    const radiusPixels = Math.min(Math.max(accuracy / metersPerPixel, 10), 200);
    const diameter = radiusPixels * 2;
    
    console.log('Accuracy calculation details:');
    console.log('- GPS accuracy:', accuracy, 'meters');
    console.log('- Map zoom level:', zoom);
    console.log('- Meters per pixel at this zoom:', metersPerPixel.toFixed(2));
    console.log('- Calculated radius in pixels:', radiusPixels.toFixed(2));
    console.log('- Final diameter:', diameter.toFixed(2), 'px');
    
    // IDENTICAL styling pattern to working markers
    circleEl.style.width = diameter + "px";
    circleEl.style.height = diameter + "px";
    circleEl.style.borderRadius = "50%";
    circleEl.style.background = "rgba(59, 130, 246, 0.1)";
    circleEl.style.border = "2px solid rgba(59, 130, 246, 0.3)";
    circleEl.style.display = "block";
    circleEl.style.pointerEvents = "none";

    console.log('Creating accuracy circle with diameter:', diameter, 'px at coordinates:', [lng, lat]);
    
    // Create marker using IDENTICAL pattern to working search markers
    const circleMarker = new nmp_mapboxgl.Marker(circleEl, { 
      anchor: "center"  // IDENTICAL to working markers
    })
    .setLngLat([lng, lat])  // IDENTICAL coordinates
    .addTo(map);

    accuracyCircleRef.current = circleMarker;
    console.log('Accuracy circle created and added to map');
  };

  const updateUserLocationMarker = (lat, lng) => {
    console.log('=== UPDATING USER LOCATION MARKER ===');
    console.log('Input coordinates - lat:', lat, 'lng:', lng);
    
    if (!window.neshanMapInstance) {
      console.warn('Map not ready for marker update');
      return;
    }

    const map = window.neshanMapInstance;
    
    // Remove existing user location marker
    if (userLocationMarkerRef.current) {
      try {
        userLocationMarkerRef.current.remove();
      } catch (error) {
        console.warn('Error removing user location marker:', error);
      }
      userLocationMarkerRef.current = null;
    }

    try {
      // Create marker element using EXACT pattern as working search markers
      const markerEl = document.createElement("div");
      
      // IDENTICAL styling approach to working search markers
      markerEl.style.display = "flex";
      markerEl.style.flexDirection = "column";
      markerEl.style.alignItems = "center";
      markerEl.style.pointerEvents = "none";
      markerEl.style.background = "transparent";
      markerEl.style.justifyContent = "center";
      
      // Create simple blue dot
      const blueDot = document.createElement("div");
      blueDot.style.width = "16px";
      blueDot.style.height = "16px";
      blueDot.style.borderRadius = "50%";
      blueDot.style.background = "#007AFF";
      blueDot.style.border = "3px solid #FFFFFF";
      blueDot.style.boxShadow = "0 2px 8px rgba(0, 122, 255, 0.6)";
      blueDot.style.animation = "locationPulse 2s infinite";
      
      // Add animation if not exists
      if (!document.getElementById('location-pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'location-pulse-animation';
        style.innerHTML = `
          @keyframes locationPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.9; }
            100% { transform: scale(1); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      markerEl.appendChild(blueDot);
      
      console.log('Creating user location marker at coordinates [lng, lat]:', [lng, lat]);
      
      // Create marker using IDENTICAL pattern to working search markers
      const userMarker = new nmp_mapboxgl.Marker(markerEl, {
        anchor: "center"  // IDENTICAL to working search markers
      })
      .setLngLat([lng, lat])  // IDENTICAL coordinates
      .addTo(map);

      console.log('✅ User location marker created and properly bound to map');
      
      userLocationMarkerRef.current = userMarker;
      
    } catch (error) {
      console.error('❌ Error creating user location marker:', error);
    }
  };
  // ============= END LOCATION TRACKING FUNCTIONS =============

  // Get user location on mount - now with real-time tracking
  useEffect(() => {
    console.log('=== ADVANCED USER LOCATION SETUP ===');
    
    // Start real-time location tracking automatically
    startLocationTracking();
    
    // Cleanup on unmount
    return () => {
      stopLocationTracking();
    };
  }, []);

  // Watch for when both map and user location are available to show blue dot
  useEffect(() => {
    console.log('=== MAP AND LOCATION SYNC CHECK ===');
    console.log('userLocation:', userLocation);
    console.log('Map instance available:', typeof window !== 'undefined' && !!window.neshanMapInstance);
    console.log('Loading state:', loading);
    
    // Show user location blue dot as soon as both map and location are available
    if (!loading && userLocation && typeof window !== 'undefined' && window.neshanMapInstance) {
      console.log('Both map and location ready - showing blue dot...');
      setTimeout(() => {
        updateLocationDisplay(userLocation);
      }, 300); // Small delay to ensure everything is initialized
    } else  {
      console.log('=== NOT READY YET ===');
      console.log('- loading:', loading);
      console.log('- userLocation exists:', !!userLocation);
      console.log('- map ready:', typeof window !== 'undefined' && !!window.neshanMapInstance);
    }
  }, [userLocation, loading]); // Trigger when userLocation changes or loading completes

  // Use trip data passed from parent, context, or fetch if not provided
  useEffect(() => {
    const initializeTripData = async () => {
      try {
        if (tripData) {
          // Use data passed from parent (highest priority)
          setTrip(tripData);
          setNumberPhone(tripData.Passenger?.NumberPhone || "");
          setDescription(tripData.Location?.Description || "");
          console.log('Using trip data from parent:', tripData);
        } else if (contextTripData) {
          // Use data from context (second priority)
          setTrip(contextTripData);
          setNumberPhone(contextTripData.Passenger?.NumberPhone || "");
          setDescription(contextTripData.Location?.Description || "");
          console.log('Using trip data from context:', contextTripData);
        } else if (tripId) {
          // Fallback: fetch data if not passed from parent or context
          const response = await fetch(`/api/trip/${tripId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const fetchedTripData = await response.json();
          setTrip(fetchedTripData);
          setNumberPhone(fetchedTripData.Passenger?.NumberPhone || "");
          setDescription(fetchedTripData.Location?.Description || "");
          
          console.log('Fetched trip data:', fetchedTripData);
        }
        // Do NOT setLoading(false) here; wait for map load
      } catch (error) {
        console.error('Error with trip data:', error);
        // Fallback to mock data if both methods fail
        const mockTrip = {
          id: tripId,
          Passenger: {
            numberPhone: "09123456789", // Default fallback number
            NumberPhone: "09123456789"  // Default fallback number
          },
          OriginCity: "Tehran",
          Location: null
        };
        setTrip(mockTrip);
        setNumberPhone(mockTrip.Passenger?.NumberPhone || "");
        setDescription(""); // Reset description for mock data
      }
    };

    initializeTripData();
  }, [tripId, tripData, contextTripData]);

  // Initialize map when component mounts - coordinates will be set in mapSetter after map loads
  useEffect(() => {
    // This useEffect now just ensures trip data is available
    // The actual coordinate setting happens in mapSetter's "load" event
    console.log('Trip data updated:', trip);
  }, [trip]);

  // Add user location marker when both map is loaded and user location is available
  useEffect(() => {
    console.log('=== USER LOCATION MARKER EFFECT ===');
    console.log('loading:', loading);
    console.log('userLocation:', userLocation);
    console.log('window exists:', typeof window !== 'undefined');
    console.log('neshanMapInstance exists:', typeof window !== 'undefined' && !!window.neshanMapInstance);
    
    if (!loading && userLocation && typeof window !== 'undefined' && window.neshanMapInstance) {
      console.log('All conditions met, adding user location marker...');
      console.log('Calling updateLocationDisplay with:', { lat: userLocation.lat, lng: userLocation.lng });
      updateLocationDisplay(userLocation);
    } else {
      console.log('Conditions not met for adding user location marker:');
      console.log('- loading is false:', !loading);
      console.log('- userLocation exists:', !!userLocation);
      console.log('- window exists:', typeof window !== 'undefined');
      console.log('- neshanMapInstance exists:', typeof window !== 'undefined' && !!window.neshanMapInstance);
    }
  }, [loading, userLocation]);

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-blue-500"></div>
          <div className="text-center space-y-3">
            <p className="text-gray-800 font-semibold text-lg">در حال بارگذاری...</p>
            <p className="text-gray-500 text-sm">لطفاً منتظر بمانید</p>
          </div>
          <Image
            className="opacity-100"
            src="/mrshoofer_logo_full.png"
            width={120}
            height={25}
            alt="mrshoofer"
          />
        </div>
      </div>
    );
  }

  // Show loading if trip data is not loaded yet
  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-blue-500"></div>
          <div className="text-center space-y-3">
            <p className="text-gray-800 font-semibold text-lg">در حال بارگذاری اطلاعات سفر...</p>
            <p className="text-gray-500 text-sm">دریافت جزئیات سفر شما</p>
          </div>
          <Image
            className="opacity-100"
            src="/mrshoofer_logo_full.png"
            width={120}
            height={25}
            alt="mrshoofer"
          />
        </div>
      </div>
    );
  }

  const mapSetter = (neshanMap) => {
    if (typeof window !== 'undefined') {
      window.neshanMapInstance = neshanMap;

      neshanMap.on("load", function () {
        setLoading(false);
        
        // Initialize map coordinates AFTER the map is loaded
        if (trip?.OriginCity) {
          if (trip?.Location == null) {
            getCoordinatesFromCityName(trip.OriginCity).then((coords) => {
              if (coords && window.neshanMapInstance) {
                console.log('Setting map center to city coordinates:', coords);
                window.neshanMapInstance.setCenter([coords.lng, coords.lat]);
                window.neshanMapInstance.setZoom(13);
              }
            });
          } else {
            const { Latitude, Longitude } = trip.Location;
            console.log('Setting map center to saved location:', { Latitude, Longitude });
            if (window.neshanMapInstance && Latitude && Longitude) {
              window.neshanMapInstance.setCenter([Longitude, Latitude]);
              window.neshanMapInstance.setZoom(14.5);
            }
          }
        }
        
        // IMPORTANT: Show user location blue dot immediately when map loads
        console.log('=== MAP LOADED - CHECKING FOR USER LOCATION ===');
        console.log('Current userLocation state:', userLocation);
        if (userLocation) {
          console.log('User location available, showing blue dot immediately...');
          setTimeout(() => {
            updateLocationDisplay(userLocation);
          }, 500); // Small delay to ensure map is fully ready
        } else {
          console.log('User location not yet available, will show when location is obtained');
        }
      });

      neshanMap.on("zoom", () => {
        const newZoom = neshanMap.getZoom();
        setZoom(newZoom);
        
        // Update accuracy circle when zoom changes (blue dot stays same size)
        if (currentLocationRef.current && accuracyCircleRef.current) {
          const currentAccuracy = currentLocationRef.current.accuracy || 50;
          console.log('Zoom changed to:', newZoom, '- updating accuracy circle');
          console.log('Current location ref:', currentLocationRef.current);
          console.log('Using accuracy value:', currentAccuracy, 'meters');
          updateAccuracyCircle(
            currentLocationRef.current.lat, 
            currentLocationRef.current.lng, 
            currentAccuracy
          );
        }
      });

      neshanMap.on("movestart", () => {
        setIsMoving(true);
      });
      neshanMap.on("moveend", () => {
        setIsMoving(false);
      });
    }
  };

  function getTypeIcon(type) {
    switch (type) {
      case "street": return "🛣️";
      case "primary": return "🛤️";
      case "secondary": return "🚦";
      case "highway": return "🚗";
      case "gym": return "🏋️";
      case "poi": return "📍";
      case "address": return "🏠";
      case "city": return "🏙️";
      case "village": return "🏡";
      case "neighbourhood": return "🏘️";
      case "park": return "🌳";
      case "hospital": return "🏥";
      case "school": return "🏫";
      case "restaurant": return "🍽️";
      case "bank": return "🏦";
      case "hotel": return "🏨";
      case "shop": return "🛒";
      case "pharmacy": return "💊";
      default: return "📌";
    }
  }

  async function getAddressFromNeshan(lat, lng) {
    const url = `https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`;
    const response = await fetch(url, {
      headers: {
        "Api-Key": API_KEY,
      },
    });
    const data = await response.json();
    return data.formatted_address || "";
  }

  async function getCoordinatesFromCityName(cityName) {
    const url = `https://api.neshan.org/v1/search?term=${encodeURIComponent(
      cityName
    )}&lat=35.6892&lng=51.389`;
    const response = await fetch(url, {
      headers: {
        "Api-Key": API_KEY,
      },
    });
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const { x: lng, y: lat } = data.items[0].location;
      return { lat, lng };
    }
    return null;
  }

  // Enhanced "My Location" button functionality
  const centerOnUserLocation = () => {
    console.log('=== CENTER ON USER LOCATION CALLED ===');
    
    if (!userLocation) {
      console.log('No user location available, starting location tracking...');
      startLocationTracking();
      return;
    }
    
    // If we have a location, center immediately and update with fresh location
    centerMapAndAddDot(userLocation);
    
    // Also request a fresh location update
    if (navigator.geolocation && !isLoadingLocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const freshLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          console.log('Fresh location obtained for centering:', freshLocation);
          
          setUserLocation(freshLocation);
          setLocationAccuracy(position.coords.accuracy);
          setIsLoadingLocation(false);
          
          // Update display with fresh location
          updateLocationDisplay(freshLocation);
        },
        (error) => {
          console.warn('Failed to get fresh location:', error);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000 // Accept cached location up to 30 seconds old
        }
      );
    }
  };

  // Helper function to center map and add blue dot
  const centerMapAndAddDot = (location) => {
    console.log('=== CENTERING MAP AND ADDING DOT ===');
    console.log('Location:', location);
    console.log('window.neshanMapInstance:', typeof window !== 'undefined' ? !!window.neshanMapInstance : 'undefined');
    
    if (location && typeof window !== 'undefined' && window.neshanMapInstance) {
      try {
        // Get the map instance
        const map = window.neshanMapInstance;
        
        // Calculate the offset coordinates like in the search selection
        // We need to offset the map center so the bottom tip of the center indicator shows our location
        const targetPixel = map.project([location.lng, location.lat]);
        
        // Apply the reverse offset (move map center UP so the tip points to our location)
        const pointerTipOffsetY = 39; // Same offset as used in handleSelectLocation
        const adjustedPixel = {
          x: targetPixel.x,
          y: targetPixel.y - pointerTipOffsetY // Move center UP so tip points DOWN to our location
        };
        
        // Convert back to coordinates
        const adjustedCoords = map.unproject(adjustedPixel);
        const mapCenterCoords = [adjustedCoords.lng, adjustedCoords.lat];
        
        console.log('Original location coordinates:', [location.lng, location.lat]);
        console.log('Adjusted map center coordinates:', mapCenterCoords);
        
        // Try flyTo first with the adjusted center
        if (typeof map.flyTo === 'function') {
          console.log('Using flyTo method with adjusted center...');
          map.flyTo({
            center: mapCenterCoords,
            zoom: 17, // Higher zoom to see the blue dot clearly
            duration: 2000, // Longer duration to see the movement
          });
          console.log('flyTo executed successfully');
          
          // Update location display after animation completes
          setTimeout(() => {
            console.log('Updating location display after flyTo animation...');
            updateLocationDisplay(location);
          }, 2100);
          
        } 
        // Fallback to easeTo if flyTo doesn't exist
        else if (typeof map.easeTo === 'function') {
          console.log('Using easeTo method with adjusted center...');
          map.easeTo({
            center: mapCenterCoords,
            zoom: 17,
            duration: 2000,
          });
          console.log('easeTo executed successfully');
          
          // Update location display after animation completes
          setTimeout(() => {
            console.log('Updating location display after easeTo animation...');
            updateLocationDisplay(location);
          }, 2100);
          
        }
        // Last resort: setCenter and setZoom
        else {
          console.log('Using setCenter/setZoom methods with adjusted center...');
          map.setCenter(mapCenterCoords);
          map.setZoom(17);
          console.log('setCenter/setZoom executed successfully');
          
          // Update location display immediately for instant methods
          setTimeout(() => {
            console.log('Updating location display after setCenter/setZoom...');
            updateLocationDisplay(location);
          }, 100);
        }
        
        // Update the selected coordinates and address (like in search selection)
        selectedCordinates.current = { lat: location.lat, lng: location.lng };
        
        // Load address for the location
        const loadAddress = async () => {
          try {
            const address = await getAddressFromNeshan(location.lat, location.lng);
            setSelectedAddress(address);
            console.log('Address loaded for user location:', address);
          } catch (error) {
            console.error('Error loading address for user location:', error);
            setSelectedAddress("آدرس در حال بارگذاری...");
          }
        };
        loadAddress();
        
        // Log the new center after a short delay
        setTimeout(() => {
          console.log('New map center after centering:', map.getCenter());
          console.log('Center indicator tip should point to:', [location.lng, location.lat]);
        }, 500);
        
      } catch (error) {
        console.error('Error centering map on user location:', error);
        console.error('Error stack:', error.stack);
      }
    } else {
      console.log('=== CANNOT CENTER MAP - MISSING REQUIREMENTS ===');
      console.log('- location exists:', !!location);
      if (location) {
        console.log('  location value:', location);
      }
      console.log('- window exists:', typeof window !== 'undefined');
      console.log('- neshanMapInstance exists:', !!(typeof window !== 'undefined' && window.neshanMapInstance));
      if (typeof window !== 'undefined' && window.neshanMapInstance) {
        console.log('  neshanMapInstance methods:', Object.getOwnPropertyNames(window.neshanMapInstance));
      }
    }
  };

  const handleSelectLocation = async () => {
    if (typeof window !== 'undefined' && window.neshanMapInstance && nmp_mapboxgl && nmp_mapboxgl.Marker) {
      try {
        // Step 1: Hide the picker immediately for visual feedback
        setIsMoving(true);
        await new Promise(resolve => setTimeout(resolve, 320));

        setIsMoving(false);

        // Brief pause to let user see the picker disappear

        await new Promise(resolve => setTimeout(resolve, 100));

        setShowPicker(false); 

        

        // Remove any existing marker before adding a new one
        if (lastMarkerRef.current) {
          lastMarkerRef.current.remove();
          lastMarkerRef.current = null;
        }

        // Get the Neshan map instance
        const map = window.neshanMapInstance;
        
        // ROBUST SOLUTION: Use the map's internal projection to calculate the offset.
        // This avoids issues with screen coordinates, viewports, and CSS.

        // 1. Get the pixel coordinates of the map's geographical center.
        const centerPixel = map.project(map.getCenter());

        // 2. Apply the visual offset in pixels.
        // Fine-tuned to match the exact visual pointer tip position
        const pointerTipOffsetY = 39; // Adjusted to match exact tip location
        const finalPixel = {
            x: centerPixel.x,
            y: centerPixel.y + pointerTipOffsetY
        };

        // 3. Convert the final pixel coordinates back to geographical coordinates.
        const pointerTipCoords = map.unproject(finalPixel);
        
        console.log('Calculated final coordinates:', pointerTipCoords);

        // Create marker element using Neshan's standard approach
        const markerEl = document.createElement("div");
        markerEl.style.display = "flex";
        markerEl.style.flexDirection = "column";
        markerEl.style.alignItems = "center";
        markerEl.style.pointerEvents = "none";
        markerEl.style.background = "transparent";
        markerEl.style.justifyContent = "center";

        // Add label
        const labelDiv = document.createElement("div");
        labelDiv.innerText = "مبدا";
        labelDiv.style.background = "white";
        labelDiv.style.fontFamily = "Vazir, sans-serif";
        labelDiv.style.padding = "1px 8px";
        labelDiv.style.borderRadius = "9px";
        labelDiv.style.marginBottom = "8px";
        labelDiv.style.fontWeight= "bold";
        labelDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        labelDiv.style.fontSize = "13px";
        labelDiv.style.pointerEvents = "none";
        labelDiv.style.opacity = 0.9;
        labelDiv.style.userSelect = "none";
        markerEl.appendChild(labelDiv);

        // Add pin icon
        const pinSpan = document.createElement("span");
        pinSpan.style.width = "33px";
        pinSpan.style.height = "33px";
        pinSpan.style.userSelect = "none";
        pinSpan.style.pointerEvents = "none";
        pinSpan.style.zIndex = "19";
        pinSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 375 375" style="display:block">
          <defs>
            <clipPath id="b3c8e86a90">
              <path d="M 187.5 0 C 83.945312 0 0 83.945312 0 187.5 C 0 291.054688 83.945312 375 187.5 375 C291.054688 375 375 291.054688 375 187.5 C375 83.945312 291.054688 0 187.5 0 Z" clip-rule="nonzero"/>
            </clipPath>
            <clipPath id="d1aebc7008">
              <path d="M 25.109375 25.109375 L 349.890625 25.109375 L 349.890625 349.890625 L 25.109375 349.890625 Z" clip-rule="nonzero"/>
            </clipPath>
            <clipPath id="afb7a861b6">
              <path d="M 187.5 25.109375 C 97.8125 25.109375 25.109375 97.8125 25.109375 187.5 C 25.109375 277.1875 97.8125 349.890625 187.5 349.890625 C277.1875 349.890625 349.890625 277.1875 349.890625 187.5 C349.890625 97.8125 277.1875 25.109375 187.5 25.109375 Z" clip-rule="nonzero"/>
            </clipPath>
            <clipPath id="66f3aec7f3">
              <path d="M 118.664062 118.664062 L 256.335938 118.664062 L 256.335938 256.335938 L 118.664062 256.335938 Z" clip-rule="nonzero"/>
            </clipPath>
            <clipPath id="70d46462f1">
              <path d="M 187.5 118.664062 C 149.480469 118.664062 118.664062 149.480469 118.664062 187.5 C 118.664062 225.519531 149.480469 256.335938 187.5 256.335938 C225.519531 256.335938 256.335938 225.519531 256.335938 187.5 C256.335938 149.480469 225.519531 118.664062 187.5 118.664062 Z" clip-rule="nonzero"/>
            </clipPath>
          </defs>
          <g clip-path="url(#b3c8e86a90)">
            <rect x="-37.5" width="450" fill="#ffffff" y="-37.5" height="450" fill-opacity="1"/>
          </g>
          <g clip-path="url(#d1aebc7008)">
            <g clip-path="url(#afb7a861b6)">
              <path fill="#004aad" d="M 25.109375 25.109375 L 349.890625 25.109375 L 349.890625 349.890625 L 25.109375 349.890625 Z" fill-opacity="1" fill-rule="nonzero"/>
            </g>
          </g>
          <g clip-path="url(#66f3aec7f3)">
            <g clip-path="url(#70d46462f1)">
              <path fill="#ffffff" d="M 118.664062 118.664062 L 256.335938 118.664062 L 256.335938 256.335938 L 118.664062 256.335938 Z" fill-opacity="1" fill-rule="nonzero"/>
            </g>
          </g>
        </svg>`;
        markerEl.appendChild(pinSpan);

        // Add line
        const lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        lineSvg.setAttribute("width", "2");
        lineSvg.setAttribute("height", "22");
        lineSvg.setAttribute("viewBox", "0 0 2 24");
        lineSvg.style.zIndex = "15";
        lineSvg.style.pointerEvents = "none";
        lineSvg.innerHTML = `<line x1="1" y1="0" x2="1" y2="24" stroke="black" stroke-width="1" stroke-linecap="round"/>`;
        markerEl.appendChild(lineSvg);

        // Initial scale for animation
        markerEl.style.transform = "scale(0)";
        

        // Create marker using Neshan Map's official approach
        const marker = new nmp_mapboxgl.Marker(markerEl, { 
          anchor: "bottom"  // Bottom anchor aligns with the line tip
        })
        .setLngLat([pointerTipCoords.lng, pointerTipCoords.lat])
        .addTo(map);

        // Animate marker appearance
        // setTimeout(() => {
        //   markerEl.style.transform = "scale(1)";
        // }, 100);

        lastMarkerRef.current = marker;

        // Store coordinates immediately
        selectedCordinates.current = { lat: pointerTipCoords.lat, lng: pointerTipCoords.lng };

        console.log('Marker placed at:', pointerTipCoords);

        // Wait before showing form
        await new Promise(resolve => setTimeout(resolve, 450));

        // Show form
        setIsMoving(false);
        setShowForm(true);


        
        // Load address in background
        try {
          const address = await getAddressFromNeshan(pointerTipCoords.lat, pointerTipCoords.lng);
          setSelectedAddress(address);
        } catch (error) {
          console.error('Error loading address:', error);
          setSelectedAddress("آدرس در حال بارگذاری...");
        }
        
      } catch (error) {
        console.error('Error in handleSelectLocation:', error);
        setIsMoving(false);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    // Log the coordinates being sent
    console.log('Coordinates being sent to database:', selectedCordinates.current);
    console.log('Latitude:', selectedCordinates.current.lat);
    console.log('Longitude:', selectedCordinates.current.lng);

    const locationData = {
      latitude: selectedCordinates.current.lat,
      longitude: selectedCordinates.current.lng,
      textAddress: selectedAddress,
      phoneNumber: numberPhone,
      description: description
    };

    console.log('Full location data being sent:', locationData);

    try {
      const response = await fetch(`/api/trip/${tripId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update location');
      }

      console.log('Location updated successfully:', result);
      
      // Update the context with the new trip data
      if (result.trip) {
        setTripData(result.trip);
      }
      
      // Navigate back to trip info page with refresh parameter
      router.push(`/trip/info/${tripId}?refresh=${Date.now()}`);
    } catch (error) {
      console.error('Error updating location:', error);
      setErrorMessage("خطا در اتصال به سرور، لطفاً دوباره امتحان کنید");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (showForm) {
      // If form is showing, go back to map selection
      handleCloseDrawer();
    } else {
      // If on map selection, go back to trip info
      router.push(`/trip/info/${tripId}`);
    }
  };

  // Enhanced function to handle drawer closing and cleanup
  const handleCloseDrawer = () => {
    // Step 1: Remove the previous marker with animation
    if (lastMarkerRef.current) {
      const markerElement = lastMarkerRef.current.getElement();
      if (markerElement) {
        // Animate marker disappearing
        markerElement.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
        markerElement.style.transform = "scale(0)";
        markerElement.style.opacity = "0";
        
        // Remove marker after animation
        setTimeout(() => {
          if (lastMarkerRef.current) {
            lastMarkerRef.current.remove();
            lastMarkerRef.current = null;
          }
        }, 300);
      } else {
        // Fallback: remove immediately if no element
        lastMarkerRef.current.remove();
        lastMarkerRef.current = null;
      }
    }
    
    // Step 2: Reset form states immediately
    setShowForm(false);
    setIsMoving(false);
    
    // Step 3: Show picker with a slight delay for smooth transition
    setTimeout(() => {
      setShowPicker(true);
    }, 200);
    
    // Step 4: Clear selected data to allow fresh selection
    setSelectedAddress("");
    selectedCordinates.current = null;
    
    // Step 4.5: Reset description to original trip value
    setDescription(trip?.Location?.Description || "");
    
    // Step 5: Clear any error messages
    setErrorMessage("");
    
    // Step 6: Optional: Reset zoom slightly for better selection experience
    if (typeof window !== 'undefined' && window.neshanMapInstance) {
      const currentZoom = window.neshanMapInstance.getZoom();
      if (currentZoom > 17) {
        // If zoomed in too much, zoom out slightly for easier navigation
        window.neshanMapInstance.easeTo({ 
          zoom: 16, 
          duration: 600,
          easing: t => t * (2 - t)
        });
      }
    }
  };

  // Handle drawer state changes (when user clicks backdrop or close button)
  const handleDrawerOpenChange = (isOpen) => {
    if (!isOpen && showForm) {
      // Drawer is being closed
      handleCloseDrawer();
    }
  };


  // Always render the map, but show a loading overlay until the map is ready

  return (
    <>
      {/* Inject custom styles */}
      <style jsx global>{customStyles}</style>
      
  <div className="fixed inset-0 w-full h-full z-0" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', overflow: 'hidden', background: '#f8fafc' }}>
      {/* Header - Optimized for Mobile */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100/30 z-50 transition-all duration-300" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 52, 
          minHeight: 52,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(248,250,252,0.92) 100%)'
        }}
      >
        <h1 className="text-base font-semibold text-gray-800 flex items-center gap-2 transition-all duration-300">
          {showForm ? (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">تایید مبدأ</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">انتخاب مبدا</span>
            </>
          )}
        </h1>
        <Button 
          variant="light" 
          size="sm" 
          onPress={handleBack}
          className="bg-white/70 hover:bg-white/90 border border-gray-200/40 shadow-sm hover:shadow transition-all duration-200 backdrop-blur-sm min-w-0 px-3"
          radius="lg"
          startContent={
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" className="transition-transform duration-200">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 18l-6-6 6-6" />
            </svg>
          }
        >
          <span className="font-medium text-gray-700 text-xs hidden sm:inline">
            {showForm ? "نقشه" : "بازگشت"}
          </span>
        </Button>
      </div>

      {/* Content */}
      {/* HeroUI Drawer for location confirmation */}
      <Drawer 
        isOpen={showForm} 
        onOpenChange={handleDrawerOpenChange}
        placement="right"
        size="full"
        hideCloseButton={false}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        classNames={{
          base: "max-w-sm sm:max-w-md",
          backdrop: "backdrop-blur-md bg-black/20",
          wrapper: "z-[9999]",
          closeButton: "z-[10000]"
        }}
      >
        <DrawerContent className="h-full bg-white">
          <DrawerHeader className="flex flex-col gap-1 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800">تایید مبدأ</h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-right leading-relaxed">
              اطلاعات مورد نیاز برای ثبت موقعیت را با دقت وارد کنید
            </p>
          </DrawerHeader>
          
          <DrawerBody className="overflow-y-auto px-6 py-6 flex-1 bg-gray-50/30 custom-scroll">
            <div className="space-y-8 h-full">
              {errorMessage && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-r-xl p-5 shadow-sm animate-slide-in">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-3 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mr-3">
                    <p className="text-blue-800 text-sm font-medium leading-relaxed">
                      هماهنگی برای سفر پیش رو با اطلاعات زیر انجام خواهد شد
                      <span className="text-red-600 mr-1">*</span>
                    </p>
                  </div>
                </div>
              </div>
              {/* Enhanced Address Field */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br bg-gray-200 rounded-md flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs">📍</span>
                  </div>
                  آدرس دقیق
                </label>
                <Textarea
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  placeholder="آدرس کامل موقعیت شما را با جزئیات بنویسید..."
                  variant="bordered"
                  maxRows={4}
                  minRows={3}
                  size="lg"
                  radius="xl"
                  classNames={{
                    base: "w-full",
                    input: "text-base leading-relaxed resize-none placeholder:text-gray-400",
                    inputWrapper: "min-h-[90px] border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  }}
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Enhanced Phone Field */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br bg-gray-200 rounded-md flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs">📞</span>
                  </div>
                  شماره تلفن
                </label>
                <Input
                  value={numberPhone}
                  onChange={(e) => setNumberPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  variant="bordered"
                  size="lg"
                  radius="xl"
                  type="tel"
                  dir="ltr"
                  classNames={{
                    base: "w-full",
                    input: "text-base text-right placeholder:text-gray-400",
                    inputWrapper: "border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  }}
                  style={{ fontSize: '16px' }}
                 
                />
              </div>

              {/* Enhanced Description Field */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br bg-gray-200 rounded-md flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  توضیحات
                  <span className="text-xs text-gray-500 font-normal">(اختیاری)</span>
                </label>
                <Input
                  type="text"
                  placeholder="طبقه، واحد، نشانه‌های مهم، کوچه..."
                  variant="bordered"
                  size="lg"
                  radius="xl"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  classNames={{
                    base: "w-full",
                    input: "text-base placeholder:text-gray-400",
                    inputWrapper: "border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  }}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          </DrawerBody>
          
          <DrawerFooter className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-6">
            <div className="flex gap-4 w-full">
              <Button
                variant="bordered"
                color="default"
                className="flex-1 h-14 text-base font-semibold border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300"
                type="button"
                onPress={handleBack}
                radius="xl"
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                بازگشت
              </Button>
              <Button
                variant="solid"
                className="flex-1 h-14 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                type="button"
                disabled={isSubmitting}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                radius="xl"
                style={{
                  background: isSubmitting 
                    ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
                    : "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                startContent={
                  !isSubmitting && (
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )
                }
              >
                <span className="text-white drop-shadow-sm">
                  {isSubmitting ? "در حال ذخیره..." : "تایید و ذخیره"}
                </span>
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Map View - Always visible */}
      <div className="absolute inset-0 flex flex-col" style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
          <MapComponent
            options={{
              mapKey: MAP_KEY,
              mapType: MapTypes.neshanPlaces,
              zoom: 16,
              isTouchPlatform: true,
              doubleClickZoom: true,
              dragPan: true,
              dragRotate: true,
              traffic: false,
              poi: true,
              trackResize: true,
              maxZoom: 19,
              minZoom: 5,
              mapTypeControllerStatus: { show: false },
              mapTypeControllerOptions: { show: false },
            }}
            mapSetter={mapSetter}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Enhanced Map Loading Overlay */}
          {loading && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-[7000] transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex flex-col items-center space-y-6 animate-fade-in">                
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-4 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse shadow-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <p className="text-gray-800 font-semibold text-lg">در حال بارگذاری نقشه</p>
                  <p className="text-gray-600 text-sm">آماده‌سازی بهترین تجربه برای شما...</p>
                  <div className="flex justify-center space-x-1 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>

                <div className="relative mt-2">
                  <Image
                    className="opacity-100"
                    src="/mrshoofer_logo_full.png"
                    width={100}
                    height={21}
                    alt="mrshoofer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Picker icon */}
          {showPicker && !loading && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%", // Centered perfectly
              transform: "translate(-50%, -50%)", // Center both horizontally and vertically
              transition: "none",
              zIndex: 2000,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              className="text-gray-800 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)",
                backdropFilter: "blur(20px)",
                padding: "4px 6px",
                borderRadius: "20px",
                marginBottom: "11px",
                fontWeight: "600",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.9)",
                fontSize: "12px",
                userSelect: "none",
                border: "1.3px solid rgba(59,130,246,0.2)",
                color: "#1f2937",
                letterSpacing: "-0.025em",
              }}
            >
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center shadow-sm">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                مبدا را انتخاب کنید
              </span>
            </div>
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "62px",
                width: "48px",
              }}
            >
              {/* Black line between pin and dot */}
              <svg
                style={{
                  position: "absolute",
                  left: "50%",
                  top: isMoving ? "40%" : "50%",
                  transform: "translateX(-50%)",
                  zIndex: 15,
                  pointerEvents: "none",
                  transition: "top 0.2s",
                }}
                width="2"
                height="22"
                viewBox="0 0 2 24"
              >
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="24"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {/* Green dot at the exact selection point */}

              {/* Pin SVG, bottom center at map center */}
              <span
                style={{
                  width: isMoving ? "28px" : "33px",
                  height: isMoving ? "28px" : "33px",
                  display: "block",
                  position: "relative",
                  bottom: 0,
                  userSelect: "none",
                  pointerEvents: "none",
                  transition: "width 0.2s, height 0.2s",
                  zIndex: 19,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 375 375"
                  style={{ display: "block" }}
                >
                  <defs>
                    <clipPath id="b3c8e86a90">
                      <path
                        d="M 187.5 0 C 83.945312 0 0 83.945312 0 187.5 C 0 291.054688 83.945312 375 187.5 375 C291.054688 375 375 291.054688 375 187.5 C375 83.945312 291.054688 0 187.5 0 Z"
                        clipRule="nonzero"
                      />
                    </clipPath>
                    <clipPath id="d1aebc7008">
                      <path
                        d="M 25.109375 25.109375 L 349.890625 25.109375 L 349.890625 349.890625 L 25.109375 349.890625 Z"
                        clipRule="nonzero"
                      />
                    </clipPath>
                    <clipPath id="afb7a861b6">
                      <path
                        d="M 187.5 25.109375 C 97.8125 25.109375 25.109375 97.8125 25.109375 187.5 C 25.109375 277.1875 97.8125 349.890625 187.5 349.890625 C277.1875 349.890625 349.890625 277.1875 349.890625 187.5 C349.890625 97.8125 277.1875 25.109375 187.5 25.109375 Z"
                        clipRule="nonzero"
                      />
                    </clipPath>
                    <clipPath id="66f3aec7f3">
                      <path
                        d="M 118.664062 118.664062 L 256.335938 118.664062 L 256.335938 256.335938 L 118.664062 256.335938 Z"
                        clipRule="nonzero"
                      />
                    </clipPath>
                    <clipPath id="70d46462f1">
                      <path
                        d="M 187.5 118.664062 C 149.480469 118.664062 118.664062 149.480469 118.664062 187.5 C 118.664062 225.519531 149.480469 256.335938 187.5 256.335938 C225.519531 256.335938 256.335938 225.519531 256.335938 187.5 C256.335938 149.480469 225.519531 118.664062 187.5 118.664062 Z"
                        clipRule="nonzero"
                      />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#b3c8e86a90)">
                    <rect
                      x="-37.5"
                      width="450"
                      fill="#ffffff"
                      y="-37.5"
                      height="450"
                      fillOpacity="1"
                    />
                  </g>
                  <g clipPath="url(#d1aebc7008)">
                    <g clipPath="url(#afb7a861b6)">
                      <path
                        fill="#004aad"
                        d="M 25.109375 25.109375 L 349.890625 25.109375 L 349.890625 349.890625 L 25.109375 349.890625 Z"
                        fillOpacity="1"
                        fillRule="nonzero"
                      />
                    </g>
                  </g>
                  <g clipPath="url(#66f3aec7f3)">
                    <g clipPath="url(#70d46462f1)">
                      <path
                        fill="#ffffff"
                        d="M 118.664062 118.664062 L 256.335938 118.664062 L 256.335938 256.335938 L 118.664062 256.335938 Z"
                        fillOpacity="1"
                        fillRule="nonzero"
                      />
                    </g>
                  </g>
                </svg>
              </span>
              {/* Animated shadow - keep it fixed under the dot, not moving */}
              <div
                style={{
                  width: isMoving ? "19px" : "8px",
                  height: isMoving ? "11px" : "8px",
                  background: "rgba(128,128,128,0.5)",
                  borderRadius: isMoving ? "40%" : "50%",
                  position: "absolute",
                  left: "50%",
                  top: "82%",
                  transform: "translate(-50%, -5%)", // always just below the dot
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isMoving ? 0.8 : 0.7,
                  transition: "width 0.25s, height 0.25s, opacity 0.25s",
                }}
              >
                <span>
                  <svg
                    fill="#000FFFF"
                    width={isMoving ? "14px" : "8px"}
                    height={isMoving ? "14px" : "8px"}
                    viewBox="0 0 19.55 19.0"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#000000"
                    strokeWidth="0.0002"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M7.8 10a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0-4.4 0z" />
                    </g>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        )}

          {/* Premium Professional Search Bar */}
          {!loading && (
          <div
            style={{
              position: "absolute",
              top: 65,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5000,
              width: "90%",
              maxWidth: 420,
            }}
            className="transition-all duration-500 ease-out"
          >
            <div className="relative group">
              {/* Search bar glow effect - only when dropdown is open */}
              {showDropdown && search && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-blue-400/30 rounded-full blur-sm opacity-20 transition duration-700"></div>
              )}
              
              <Input
                isClearable
                classNames={{
                  label: "text-black/70 dark:text-white/90",
                  input: [
                    "text-xs",
                    "font-md",
                    "text-black/90 dark:text-white/90",
                    "placeholder:text-xs placeholder:text-gray-600 dark:placeholder:text-white/40",
                    "leading-relaxed",
                  ],
                  innerWrapper: "bg-transparent px-1",
                  inputWrapper: [
                    "relative",
                    "shadow-[0_15px_50px_rgba(0,0,0,0.10)]",
                    "bg-white/95",
                    "dark:bg-gray-900/95",
                    "backdrop-blur-2xl fs-sm",
                    "backdrop-saturate-150",
                    "border-2 border-white/60",
                    "dark:border-gray-700/60",
                    "hover:border-blue-400/60",
                    "hover:bg-white/98",
                    "dark:hover:bg-gray-900/98",
                    "group-data-[focus=true]:bg-white",
                    "dark:group-data-[focus=true]:bg-gray-900",
                    "group-data-[focus=true]:border-blue-500/80",
                    showDropdown && search ? "group-data-[focus=true]:shadow-[0_20px_80px_rgba(59,130,246,0.15)]" : "",
                    "!cursor-text",
                    "transition-all duration-400 ease-out",
                    "min-h-[53px]",
                    "py-2",
                    "ps-1"
                  ].filter(Boolean),
                }}
                label=""
                placeholder="جستجوی آدرس، نام محله، خیابان و..."
                radius="full"
                size="lg"
                startContent={
                  <div className="bg-slate-200 p-2 rounded-full shadow-xl hover:shadow-xl transition-all duration-300">
                    <SearchIcon className="text-gray-900 w-4.5 h-4.5" />
                  </div>
                }
                endContent={
                  search && (
                    <div className="flex items-center gap-2">
                      {searchLoading ? (
                        <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : isSearchFocused ? (
                        // Show result count when focused
                        <div className="text-xs text-gray-800 bg-gray-200 px-2 py-1 rounded-full font-medium">
                          {results.length} نتیجه
                        </div>
                      ) : (
                        // Show clear button when not focused
                        <div
                          onClick={() => {
                            setSearch("");
                            setResults([]);
                            setShowDropdown(false);
                            setSearchLoading(false);
                            currentSearchRef.current = null;
                            if (searchTimeoutRef.current) {
                              clearTimeout(searchTimeoutRef.current);
                              searchTimeoutRef.current = null;
                            }
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSearch("");
                              setResults([]);
                              setShowDropdown(false);
                              setSearchLoading(false);
                              currentSearchRef.current = null;
                              if (searchTimeoutRef.current) {
                                clearTimeout(searchTimeoutRef.current);
                                searchTimeoutRef.current = null;
                              }
                            }
                          }}
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                }
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onClear={() => {
                  setSearch("");
                  setResults([]);
                  setShowDropdown(false);
                  setSearchLoading(false);
                  currentSearchRef.current = null;
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                    searchTimeoutRef.current = null;
                  }
                }}
              />
              
              {/* Enhanced micro-interactions - only when dropdown is open */}
              {showDropdown && search && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/3 via-transparent to-purple-500/3 opacity-60 transition-opacity duration-500 pointer-events-none"></div>
              )}
            </div>

            {/* Enhanced dropdown with better styling */}
            {showDropdown && search && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "20px 20px 20px 20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)",
                  maxHeight: 280,
                  overflowY: "auto",
                  marginTop: "8px",
                  direction: "rtl",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  zIndex: 5100,
                }}
                className="animate-slide-down"
              >
                {results.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-gray-400 text-sm mb-2">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      نتیجه ای یافت نشد
                    </div>
                    <p className="text-xs text-gray-500">عبارت دیگری را امتحان کنید</p>
                  </div>
                ) : (
                  results.map((item, index) => (
                    <div
                      className="text-sm hover:bg-blue-50/80 transition-all duration-200 border-b border-gray-100/50 last:border-b-0"
                      key={item.location.x + "," + item.location.y}
                      style={{
                        padding: "14px 16px",
                        cursor: "pointer",
                        background: "transparent",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                      }}
                      onClick={() => {
                        currentSearchRef.current = null;
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                          searchTimeoutRef.current = null;
                        }
                        
                        setShowDropdown(false);
                        setResults([]);
                        setSearchLoading(false);
                        
                        isProgrammaticSearch.current = true;
                        setSearch(item.title);
                        
                        setTimeout(() => {
                          if (typeof window !== 'undefined' && window.neshanMapInstance) {
                            const map = window.neshanMapInstance;
                            const searchedCoords = [item.location.x, item.location.y];
                            const searchPixel = map.project(searchedCoords);
                            const offsetMapCenter = map.unproject([
                              searchPixel.x,
                              searchPixel.y - 45
                            ]);
                            
                            console.log('Search result coordinates:', item.location);
                            console.log('Offsetting map center to:', offsetMapCenter);
                            
                            // Smooth animation without zoom change
                            map.easeTo({ 
                              center: [offsetMapCenter.lng, offsetMapCenter.lat],
                              duration: 1000,
                              easing: t => t * (2 - t) // easeOutQuad for smooth animation
                            });
                          }
                        }, 50);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-100 hover:border-blue-200 transition-colors duration-200">
                            <span className="text-gray-600 text-sm font-medium">{getTypeIcon(item.type)}</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 mb-1 truncate">{item.title}</div>
                          <div className="text-xs text-gray-600 leading-relaxed">
                            {item.address}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          )}

          {/* My Location Button - Google Maps Style with Status */}
          {!loading && (
          <div
            className="fixed right-4 z-50"
            style={{
              bottom: 130, // Position above the select button
              zIndex: 5500,
            }}
          >
            <Button
              isIconOnly
              isDisabled={locationError || (!userLocation && !isTrackingLocation)}
              className={`w-12 h-12 border-2 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm ${
                locationError 
                  ? 'bg-red-50/95 hover:bg-red-100 border-red-200/60 hover:border-red-300' 
                  : !userLocation && !isTrackingLocation
                  ? 'bg-gray-50/95 border-gray-200/60 opacity-50 cursor-not-allowed'
                  : 'bg-white/95 hover:bg-white border-gray-200/60 hover:border-gray-300'
              }`}
              radius="full"
              onClick={centerOnUserLocation}
              onTouchStart={() => {
                // Haptic feedback for mobile (only if not disabled)
                if (!locationError && (userLocation || isTrackingLocation) && 'vibrate' in navigator) {
                  navigator.vibrate(10);
                }
              }}
            >
              <div className="relative">
                {locationError ? (
                  // Error state - show warning icon
                  <svg 
                    className="w-6 h-6 text-red-500" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                ) : !userLocation && !isTrackingLocation ? (
                  // No location available - show disabled GPS icon
                  <svg 
                    className="w-6 h-6 text-gray-400" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                  </svg>
                ) : isLoadingLocation ? (
                  // Loading state - show spinning icon
                  <svg 
                    className="w-6 h-6 text-blue-600 animate-spin" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                  </svg>
                ) : (
                  // Normal state - show crosshair/target icon for precise location
                  <>
                    <svg 
                      className="w-8 h-8 text-blue-600" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11.5 20.95v-.961q-3.125-.293-5.16-2.328q-2.036-2.036-2.328-5.161H3.05q-.212 0-.356-.144t-.144-.357t.144-.356t.356-.143h.962q.292-3.125 2.328-5.16t5.16-2.328V3.05q0-.212.144-.356t.357-.144t.356.144t.143.356v.962q3.125.292 5.16 2.328t2.329 5.16h.961q.213 0 .356.144t.144.357t-.144.356t-.356.143h-.961q-.293 3.125-2.328 5.16q-2.036 2.036-5.161 2.329v.961q0 .213-.144.356t-.357.144t-.356-.144t-.143-.356M12 19q2.9 0 4.95-2.05T19 12t-2.05-4.95T12 5T7.05 7.05T5 12t2.05 4.95T12 19m0-4q-1.237 0-2.119-.881T9 12t.881-2.119T12 9t2.119.881T15 12t-.881 2.119T12 15"/>
                    </svg>
                    {/* Small blue dot in center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                  </>
                )}
              </div>
            </Button>
            
            {/* Status tooltip/indicator */}
            {locationError && (
              <div className="absolute bottom-14 right-0 bg-blue-50/95 border border-blue-200/60 text-blue-800 px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>اجازه موقعیت داده نشده است</span>
                </div>
              </div>
            )}
            {!locationError && !userLocation && !isTrackingLocation && (
              <div className="absolute bottom-14 right-0 bg-amber-50/95 border border-amber-200/60 text-amber-800 px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>موقعیت در دسترس نیست</span>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Mobile-Optimized Select Button */}
          {!loading && (
          <div
            className="px-3 sm:px-4"
            style={{
              position: "fixed",
              left: 8,
              right: 8,
              bottom: 8,
              zIndex: showForm ? -1 : 6000,
              background: "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 -12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.25)",
              borderRadius: "28px 28px 20px 20px",
              padding: "16px 12px 16px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 92,
              opacity: showForm ? 0 : 1,
              transform: showForm ? "translateY(100%)" : "translateY(0)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: showForm ? "none" : "auto",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            <Button
              className={`w-full transition-all duration-200 font-bold ${
                showForm ? 'scale-95 opacity-50' : 'scale-100 opacity-100 active:scale-[0.96]'
              }`}
              variant="solid"
              size="lg"
              onClick={handleSelectLocation}
              radius="xl"
              disabled={showForm}
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)",
                boxShadow: "0 8px 32px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.15)",
                minHeight: "54px",
                fontSize: "15px",
                fontWeight: "600",
                padding: "0 18px",
                borderRadius: "18px",
              }}
              onTouchStart={() => {
                // Haptic feedback simulation for mobile
                if ('vibrate' in navigator) {
                  navigator.vibrate(10);
                }
              }}
            >
              <div className="flex items-center justify-center gap-1 w-full">
                <div className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white drop-shadow-md flex-1 text-center font-semibold tracking-normal">
                  انتخاب این موقعیت
                </span>
                <div className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </Button>
            
            {/* Mobile-optimized hint text */}
            <p className="text-xs text-gray-600 mt-2 text-center opacity-80 font-medium leading-relaxed px-2">
              نقشه را حرکت دهید و موقعیت مبدا را انتخاب کنید
            </p>
          </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LocationSelectorPage;
