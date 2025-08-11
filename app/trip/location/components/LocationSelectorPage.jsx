"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Input } from "@heroui/react";
import { Textarea } from "@heroui/react";

import { UpdateLocation } from "@/app/trip/actions";

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

function LocationSelectorPage({ tripId }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [zoom, setZoom] = useState(11);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showPicker, setShowPicker] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [numberPhone, setNumberPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const selectedMarkerRef = useRef(null);
  const lastMarkerRef = useRef(null);
  const selectedCordinates = useRef({ lat: 0, lng: 0 });
  const searchTimeoutRef = useRef(null);

  // Ensure component only renders on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    if (search.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchNeshan(search);
      }, 400); // Wait 400ms after user stops typing
    } else {
      // Clear results immediately if search is empty
      setResults([]);
      setShowDropdown(false);
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Get user location on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        // You'll need to implement getTripById or fetch trip data here
        // For now, we'll simulate the trip data structure
        const mockTrip = {
          id: tripId,
          Passenger: {
            numberPhone: "",
            NumberPhone: ""
          },
          OriginCity: "Tehran",
          Location: null
        };
        setTrip(mockTrip);
        setNumberPhone(mockTrip.Passenger?.NumberPhone || "");
        // Do NOT setLoading(false) here; wait for map load
      } catch (error) {
        console.error('Error fetching trip:', error);
        // Do NOT setLoading(false) here; wait for map load
      }
    };

    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  // Initialize map when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && trip?.OriginCity) {
      if (trip?.Location == null) {
        getCoordinatesFromCityName(trip.OriginCity).then((coords) => {
          if (coords && window.neshanMapInstance) {
            window.neshanMapInstance.setCenter([coords.lng, coords.lat]);
            window.neshanMapInstance.setZoom(13);
          }
        });
      } else {
        const { Latitude, Longitude } = trip.Location;
        if (window.neshanMapInstance) {
          window.neshanMapInstance.setCenter([Longitude, Latitude]);
          window.neshanMapInstance.setZoom(14.5);
        }
      }
    }
  }, [trip]);

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Image
            className="mb-4"
            src="/mrshoofer_logo_full.png"
            width={190}
            height={40}
            alt="mrshoofer"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="mt-2">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  // Show loading if trip data is not loaded yet
  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Image
            className="mb-4"
            src="/mrshoofer_logo_full.png"
            width={190}
            height={40}
            alt="mrshoofer"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="mt-2">در حال بارگذاری اطلاعات سفر...</span>
        </div>
      </div>
    );
  }

  const mapSetter = (neshanMap) => {
    if (typeof window !== 'undefined') {
      window.neshanMapInstance = neshanMap;

      neshanMap.on("load", function () {
        setLoading(false);
      });

      neshanMap.on("zoom", () => {
        setZoom(neshanMap.getZoom());
      });

      neshanMap.on("movestart", () => {
        setIsMoving(true);
      });
      neshanMap.on("moveend", () => {
        setIsMoving(false);
      });
    }
  };

  async function searchNeshan(query) {
    if (!query || typeof window === 'undefined' || !window.neshanMapInstance) {
      setResults([]);
      return;
    }

    const center = window.neshanMapInstance.getCenter();
    const lat = center.lat;
    const lng = center.lng;
    const url = `https://api.neshan.org/v1/search?term=${encodeURIComponent(
      query
    )}&lat=${lat}&lng=${lng}`;
    const response = await fetch(url, {
      headers: {
        "Api-Key": API_KEY,
      },
    });
    const data = await response.json();
    setResults(data.items || []);
    setShowDropdown(true);
  }

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

  const handleSelectLocation = async () => {
    if (typeof window !== 'undefined' && window.neshanMapInstance && nmp_mapboxgl && nmp_mapboxgl.Marker) {
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), 350);

      // Get the map center coordinates directly (where the red dot is)
      const centerCoordinates = window.neshanMapInstance.getCenter();

      // Marker rendering (unchanged)
      const el = document.createElement("div");
      el.style.display = "flex";
      el.style.flexDirection = "column";
      el.style.alignItems = "center";
      el.style.pointerEvents = "none";
      el.style.background = "transparent";
      el.style.justifyContent = "center";

      const labelDiv = document.createElement("div");
      labelDiv.innerText = "مبدا";
      labelDiv.style.background = "white";
      labelDiv.style.fontFamily = "Vazir, sans-serif";
      labelDiv.style.padding = "1px 8px";
      labelDiv.style.borderRadius = "9px";
      labelDiv.style.marginBottom = "8px";
      labelDiv.style.fontWeight = "bold";
      labelDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
      labelDiv.style.fontSize = "14px";
      labelDiv.style.pointerEvents = "none";
      labelDiv.style.border = "2px solid perpule"; // Change to your desired color
      labelDiv.style.userSelect = "none";
      el.appendChild(labelDiv);

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

      el.appendChild(pinSpan);

      const lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      lineSvg.setAttribute("width", "2");
      lineSvg.setAttribute("height", "22");
      lineSvg.setAttribute("viewBox", "0 0 2 24");
      lineSvg.style.zIndex = "15";
      lineSvg.style.pointerEvents = "none";
      lineSvg.innerHTML = `<line x1="1" y1="0" x2="1" y2="24" stroke="black" stroke-width="1" stroke-linecap="round"/>`;
      el.appendChild(lineSvg);

      const marker = new nmp_mapboxgl.Marker(el, { anchor: "bottom" })
        .setLngLat([centerCoordinates.lng, centerCoordinates.lat])
        .addTo(window.neshanMapInstance);

      lastMarkerRef.current = marker;
      window.neshanMapInstance.easeTo({ zoom: 16.2, duration: 1200 });

      const address = await getAddressFromNeshan(centerCoordinates.lat, centerCoordinates.lng);
      setSelectedAddress(address);
      selectedCordinates.current = { lat: centerCoordinates.lat, lng: centerCoordinates.lng };

      setShowPicker(false);
      setShowForm(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const data = new FormData(event.currentTarget);
    data.set("tripId", tripId);
    data.set("lat", selectedCordinates.current.lat.toString());
    data.set("lng", selectedCordinates.current.lng.toString());
    data.set("address", selectedAddress);
    data.set("phonenumber", numberPhone);
    data.set("description", description);

    try {
      await UpdateLocation(data);
      onSuccess(); // Navigate back to trip info page
    } catch (error) {
      setErrorMessage("خطا در اتصال به سرور، لطفاً دوباره امتحان کنید");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (showForm) {
      // If form is showing, go back to map selection
      if (lastMarkerRef.current) {
        lastMarkerRef.current.remove();
        lastMarkerRef.current = null;
      }
      setShowForm(false);
      setShowPicker(true);
    } else {
      // If on map selection, go back to trip info
      onCancel();
    }
  };


  // Always render the map, but show a loading overlay until the map is ready

  return (
    <div className="flex flex-col w-full h-screen" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white bg-opacity-24 rounded-xl shadow-sm z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, minHeight: 56 }}>
        
        <h1 className="text-lg font-bold">

          {showForm ? "تایید مبدأ" : <>
          <svg className="inline" xmlns="http://www.w3.org/2000/svg" width={27} height={27} viewBox="0 0 20 20"><g fill="none"><path fill="url(#fluentColorLocationRipple202)" d="M17 16c0 2-3.5 3-7 3s-7-1-7-3s3.5-3 7-3s7 1 7 3"></path><path fill="url(#fluentColorLocationRipple200)" d="M10 2a6 6 0 0 0-6 6c0 1.468.843 3.007 1.807 4.306c.98 1.319 2.152 2.48 2.945 3.207a1.835 1.835 0 0 0 2.496 0c.793-.727 1.966-1.888 2.945-3.207C15.157 11.007 16 9.468 16 8a6 6 0 0 0-6-6"></path><path fill="url(#fluentColorLocationRipple201)" d="M12 8a2 2 0 1 1-4 0a2 2 0 0 1 4 0"></path><defs><linearGradient id="fluentColorLocationRipple200" x1={1.375} x2={11.372} y1={-2.001} y2={13.723} gradientUnits="userSpaceOnUse"><stop stopColor="#f97dbd"></stop><stop offset={1} stopColor="#d7257d"></stop></linearGradient><linearGradient id="fluentColorLocationRipple201" x1={8.232} x2={10.315} y1={8.177} y2={10.343} gradientUnits="userSpaceOnUse"><stop stopColor="#fdfdfd"></stop><stop offset={1} stopColor="#fecbe6"></stop></linearGradient><radialGradient id="fluentColorLocationRipple202" cx={0} cy={0} r={1} gradientTransform="matrix(10.99996 -1.99998 .85714 4.71428 9.5 15)" gradientUnits="userSpaceOnUse"><stop stopColor="#7b7bff"></stop><stop offset={0.502} stopColor="#a3a3ff"></stop><stop offset={1} stopColor="#ceb0ff"></stop></radialGradient></defs></g></svg> انتخاب مبدا</>
          
          }
        </h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className=""
           endContent={<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeDasharray={10} strokeDashoffset={10} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l5 -5M9 12l5 5"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="10;0"></animate></path></svg>}
        >
          
          {showForm ? "بازگشت به نقشه" : "بازگشت"}

         
        </Button>
      </div>

      {/* Content */}
      {showForm ? (
        // Bottom Sheet Form View
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5000,
            background: "rgba(255,255,255,0.98)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            padding: "24px 20px 32px 20px",
            height: 240,
            minHeight: 180,
            maxHeight: 320,
            overflowY: 'auto',
            transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
            transform: showForm ? "translateY(0%)" : "translateY(100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ width: 40, height: 5, background: "#ddd", borderRadius: 3, margin: "0 auto 18px auto" }} />
          <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md mx-auto">
            {errorMessage && (
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">آدرس</label>
              <Textarea
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                placeholder="آدرس موقعیت شما"
                variant="faded"
                maxRows={3}
                style={{ fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">شماره تلفن</label>
              <Input
                value={numberPhone}
                onChange={(e) => setNumberPhone(e.target.value)}
                variant="faded"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">توضیحات (اختیاری)</label>
              <Input
                type="text"
                placeholder="توضیحات اضافی"
                variant="faded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                color="default"
                className="flex-1 py-5"
                type="button"
                onClick={handleBack}
              >
                بازگشت
              </Button>
              <Button
                variant={isSubmitting ? "faded" : "solid"}
                color="secondary"
                className="flex-1 py-5"
                size="lg"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "درحال ثبت مبدأ ..." : "تایید و ذخیره"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        // Map View
        // Map settings
        <div className="flex-1 flex flex-col relative" style={{ minHeight: 0, marginTop: 49, marginBottom: 72, overflow: 'hidden' }}>
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

          {/* Picker icon */}
          {showPicker && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "45%", // Just slightly above the red dot center
              transform: "translate(-50%, -50%)",
              transition: "none",
              zIndex: 10,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              className="text-gray-800"
              style={{
                background: "white",
                padding: "3px 6px",
                borderRadius: "9px",
                marginBottom: "8px",
                fontWeight: "normal",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                fontSize: "14px",
                userSelect: "none",
              }}
            >
              مبدا را انتخاب کنید
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

          {/* Search bar */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              width: "90%",
              maxWidth: 400,
            }}
          >
            <Input
              isClearable
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "text-base",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "",
                inputWrapper: [
                  "shadow-xl",
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focus=true]:bg-default-200/50",
                  "dark:group-data-[focus=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              label="جستجو"
              placeholder="جستجوی نام محله، خیابان، شرکت ..."
              radius="lg"
              startContent={
                <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
              }
              style={{
                fontSize: '16px',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            {showDropdown && search && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "0 0 8px 8px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
                  maxHeight: 250,
                  overflowY: "auto",
                  marginTop: "-2px",
                  direction: "rtl",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  zIndex: 3000,
                }}
              >
                {results.length === 0 ? (
                  <div
                    style={{
                      padding: "12px",
                      color: "#888",
                      textAlign: "center",
                    }}
                  >
                    نتیجه ای یافت نشد
                  </div>
                ) : (
                  results.map((item) => (
                    <div
                      className="text-sm"
                      key={item.location.x + "," + item.location.y}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                      onClick={() => {
                        setShowDropdown(false);
                        setSearch(item.title);
                        setResults([]);
                        if (typeof window !== 'undefined' && window.neshanMapInstance) {
                          const map = window.neshanMapInstance;
                          // Center the map directly on the searched location (where the red dot will indicate selection)
                          // Note: Neshan API returns {x: longitude, y: latitude}
                          const targetLngLat = [item.location.x, item.location.y];
                          console.log('Search result coordinates:', item.location, 'Setting center to:', targetLngLat);
                          map.setCenter(targetLngLat);
                          map.easeTo({ 
                            zoom: 16, 
                            duration: 1000 
                          });
                        }
                      }}
                    >
                      <div className="flex justify-normal">
                        {item.type && (
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#2196f3",
                              marginTop: "2px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>{getTypeIcon(item.type)}</span>
                          </div>
                        )}

                        <div className="flex-1 ms-4">
                          <div style={{ fontWeight: "bold" }}>{item.title}</div>
                          <div style={{ fontSize: "13px", color: "#888" }}>
                            {item.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Select button */}
          <div
          className="px-4"
            style={{
              position: "fixed",
              left: 10,
              right: 10,
              bottom: 10,
              zIndex: 4000,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
              padding: "16px 0 16px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 79,
            }}
          >
            <Button
              className="w-full py-6 px-4"
              variant="solid"
              color="warning"
              size="lg"
              onClick={handleSelectLocation}
            >
              انتخاب این موقعیت
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationSelectorPage;
