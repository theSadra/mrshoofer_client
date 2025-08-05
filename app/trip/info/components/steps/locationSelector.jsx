"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import polyline from "@mapbox/polyline";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Input } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Textarea,
  useDisclosure,
} from "@heroui/react";

import { UpdateLocation } from "@/app/trip/actions";

export const SearchIcon = (props) => {
  return (
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
};

const MAP_KEY =
  process.env.NEXT_PUBLIC_NESHAN_MAP_KEY ||
  "web.629d398efe5a4b3d90b9d032569935a6";
const API_KEY =
  process.env.NEXT_PUBLIC_NESHAN_API_KEY ||
  "service.6f5734c50a9c43cba6f43a6254c1b668";

function LocationSelector({ isOpen, trip, setIsOpen }) {
  const [isMoving, setIsMoving] = useState(false);
  const [zoom, setZoom] = useState(11);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectedMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showPicker, setShowPicker] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [mounted, setMounted] = useState(true); // Always mounted for debug
  const [sheetKey, setSheetKey] = useState(0);
  const inputRef = useRef(null); // 1. Add ref

  const [numberPhone, setNumberPhone] = useState(trip.Passenger.numberPhone);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    isOpen: sheetIsOpen,
    onOpen: openSheet,
    onOpenChange,
  } = useDisclosure();

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
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

  const selectedCordinates = useRef({ lat: 0, lng: 0 });

  const mapSetter = (neshanMap) => {
    window.neshanMapInstance = neshanMap;

    const routes = [];
    const points = [];

    const routeObj = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiLineString",
            coordinates: routes,
          },
        },
      ],
    };

    const pointsObj = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiPoint",
            coordinates: points,
          },
        },
      ],
    };

    neshanMap.on("load", function () {
      setLoading(false); // Hide loading when map is ready
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
  };

  // Resize map when modal opens
  useEffect(() => {
    if (isOpen && window.neshanMapInstance) {
      setTimeout(() => {
        window.neshanMapInstance.resize();
      }, 10);
    }
  }, [isOpen]);

  // Only render Sheet on client to avoid hydration errors
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // Add this effect - it will force the map to resize multiple times
  // Add this final method - it will ensure the map is fully rendered
  useEffect(() => {
    if (isOpen) {
      // Create a complete initialization function
      const forceMapRender = () => {
        if (window.neshanMapInstance) {
          // METHOD 1: Basic resize
          window.neshanMapInstance.resize();
        }
      };

      return () => {
        window.removeEventListener("resize", forceMapRender);
      };
    }
  }, [isOpen]);

  // Show user's live location as a blue dot
  // useEffect(() => {
  //   if (!navigator.geolocation) return;
  //   let watchId;

  //   function addOrUpdateUserMarker(lng, lat) {
  //     if (!window.neshanMapInstance) return;
  //     if (userMarkerRef.current) {
  //       userMarkerRef.current.setLngLat([lng, lat]);
  //     } else {
  //       const el = document.createElement("div");
  //       el.style.width = "18px";
  //       el.style.height = "18px";
  //       el.style.border = "3px solid #fff";
  //       el.style.borderRadius = "50%";
  //       el.style.boxShadow = "0 2px 8px rgba(33,150,243,0.3)";
  //       el.style.pointerEvents = "none";
  //       userMarkerRef.current = new nmp_mapboxgl.Marker(el)
  //         .setLngLat([lng, lat])
  //         .addTo(window.neshanMapInstance);
  //     }
  //   }

  //   function startWatch() {
  //     watchId = navigator.geolocation.watchPosition(
  //       (pos) => {
  //         const { latitude, longitude } = pos.coords;
  //         addOrUpdateUserMarker(longitude, latitude);
  //       },
  //       () => {},
  //       { enableHighAccuracy: true }
  //     );
  //   }

  //   if (window.neshanMapInstance) {
  //     startWatch();
  //   } else {
  //     const interval = setInterval(() => {
  //       if (window.neshanMapInstance) {
  //         startWatch();
  //         clearInterval(interval);
  //       }
  //     }, 300);
  //     return () => clearInterval(interval);
  //   }

  //   return () => {
  //     if (watchId) navigator.geolocation.clearWatch(watchId);
  //     if (userMarkerRef.current) {
  //       userMarkerRef.current.remove();
  //       userMarkerRef.current = null;
  //     }
  //   };
  // }, []);

  async function searchNeshan(query) {
    if (!query) {
      setResults([]);
      return;
    }
    // Use user location if available, otherwise default to Tehran

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
      case "street":
        return "🛣️";
      case "primary":
        return "🛤️";
      case "secondary":
        return "🚦";
      case "highway":
        return "🚗";
      case "gym":
        return "🏋️";
      case "poi":
        return "📍";
      case "address":
        return "🏠";
      case "city":
        return "🏙️";
      case "village":
        return "🏡";
      case "neighbourhood":
        return "🏘️";
      case "park":
        return "🌳";
      case "hospital":
        return "🏥";
      case "school":
        return "🏫";
      case "restaurant":
        return "🍽️";
      case "bank":
        return "🏦";
      case "hotel":
        return "🏨";
      case "shop":
        return "🛒";
      case "pharmacy":
        return "💊";
      default:
        return "📌";
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

  const lastMarkerRef = useRef(null);

  const handleSelectLocation = async () => {
    if (window.neshanMapInstance && nmp_mapboxgl && nmp_mapboxgl.Marker) {
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), 350);

      const center = window.neshanMapInstance.getCenter();

      // نمایش مختصات به صورت alert
      console.log(
        `مختصات انتخاب شده:\nLatitude: ${center.lat}\nLongitude: ${center.lng}`
      );

      // // ساخت دایره سیاه (مثل خط 625، اما بدون انیمیشن)
      // const blackDot = document.createElement("div");
      // blackDot.style.width = "8px";
      // blackDot.style.height = "8px";
      // blackDot.style.background = "rgba(128,128,128,0.5)";
      // blackDot.style.borderRadius = "50%";
      // blackDot.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      // blackDot.style.pointerEvents = "none";
      // blackDot.style.display = "flex";
      // blackDot.style.alignItems = "center";
      // blackDot.style.justifyContent = "center";
      // blackDot.style.opacity = "0.7";

      // // ساخت مارکر با تصویر پین (مثلاً pin.png)
      // const pinImg = document.createElement("img");
      // pinImg.src = "/pin.png"; // مسیر تصویر پین خود را قرار دهید
      // pinImg.style.width = "40px";
      // pinImg.style.height = "40px";
      // pinImg.style.objectFit = "contain";
      // pinImg.style.pointerEvents = "none";
      // pinImg.alt = "Pin";

      // // new nmp_mapboxgl.Marker(pinImg, { anchor: "bottom" })
      // //   .setLngLat([center.lng, center.lat])
      // //   .addTo(window.neshanMapInstance);

      // new nmp_mapboxgl.Marker(blackDot, { anchor: "bottom" })
      //   .setLngLat([center.lng, center.lat])
      //   .addTo(window.neshanMapboxgl);

      const el = document.createElement("div");
      el.style.display = "flex";
      el.style.flexDirection = "column";
      el.style.alignItems = "center";
      el.style.pointerEvents = "none";
      el.style.background = "transparent";
      el.style.justifyContent = "center";

      // --- Add the label above the pin ---
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
      // --- End label block ---

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
      </svg>
    `;

      el.appendChild(pinSpan);

      const lineSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      lineSvg.setAttribute("width", "2");
      lineSvg.setAttribute("height", "22");
      lineSvg.setAttribute("viewBox", "0 0 2 24");
      lineSvg.style.zIndex = "15";
      lineSvg.style.pointerEvents = "none";
      lineSvg.innerHTML = `<line x1="1" y1="0" x2="1" y2="24" stroke="black" stroke-width="1" stroke-linecap="round"/>`;
      el.appendChild(lineSvg);

      // Add marker to map
      const marker = new nmp_mapboxgl.Marker(el, { anchor: "bottom" })
        .setLngLat([center.lng, center.lat])
        .addTo(window.neshanMapInstance);

      lastMarkerRef.current = marker;

      window.neshanMapInstance.easeTo({ zoom: 16.2, duration: 1200 });

      const address = await getAddressFromNeshan(center.lat, center.lng);
      setSelectedAddress(address);

      selectedCordinates.current = { lat: center.lat, lng: center.lng };

      console.log(trip);
      console.log(trip.Passenger);
      console.log(trip);

      setTimeout(() => {
        openSheet();
      }, 300);
      setShowPicker(false);
    }
  };

  async function getCoordinatesFromCityName(cityName) {
    // Example: using Neshan’s search API with the city name
    const url = `https://api.neshan.org/v1/search?term=${encodeURIComponent(
      cityName
    )}&lat=35.6892&lng=51.389`;
    const response = await fetch(url, {
      headers: {
        "Api-Key": API_KEY, // Same as used above
      },
    });
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const { x: lng, y: lat } = data.items[0].location;
      return { lat, lng };
    }
    return null;
  }

  // Then call it (e.g., in useEffect)
  useEffect(() => {
    if (isOpen && trip?.OriginCity) {
      // There is no pre selected location
      // Picking the center of the map
      if (trip?.Location == null) {
        getCoordinatesFromCityName(trip.OriginCity).then((coords) => {
          if (coords && window.neshanMapInstance) {
            window.neshanMapInstance.setCenter([coords.lng, coords.lat]);
            window.neshanMapInstance.setZoom(13);
          }
        });
      }
      // The location exists and just needs to be updated
      else {
        const { Latitude, Longitude } = trip.Location;
        if (window.neshanMapInstance) {
          window.neshanMapInstance.setCenter([Longitude, Latitude]);
          window.neshanMapInstance.setZoom(14.5);
        }
      }
    }
  }, [isOpen]);

  // Handle mobile keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      // Only handle viewport height if not inside drawer
      const isInDrawer = document.querySelector('[data-slot="drawer-content"]');
      if (!isInDrawer) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };

    const handleFocusIn = (e) => {
      // Prevent zoom on input focus for mobile
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Don't manipulate body scroll if inside drawer
        const isInDrawer = e.target.closest('[data-slot="drawer-content"]');
        if (!isInDrawer) {
          document.body.classList.add('mobile-keyboard-active');
        }
        
        // For iOS, scroll into view after keyboard appears
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    };

    const handleFocusOut = () => {
      // Remove mobile keyboard class from body
      document.body.classList.remove('mobile-keyboard-active');
      
      // Don't reset scroll if inside drawer
      const isInDrawer = document.querySelector('[data-slot="drawer-content"]');
      if (!isInDrawer && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 300);
      }
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.body.classList.remove('mobile-keyboard-active');
    };
  }, []);

  return (
    <div
      className="flex flex-col w-full h-full"
      style={{ 
        position: "relative",
        height: "100%",
        minHeight: "100%"
      }}
    >
      {/* Map area */}
      <div
        style={{
          flex: "1 1 0%",
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
          paddingBottom: "110px", // Add padding so map content isn't hidden by the fixed button
          height: "100%",
          width: "100%",
        }}
      >
        {loading && (
          <div
            className="flex items-center justify-center flex-col text-gay-600"
            style={{
              position: "absolute",
              zIndex: 2000,
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255,255,255,0.70)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            <Image
              className="mb-4"
              src="/mrshoofer_logo_full.png"
              width={190}
              height={40}
              alt="mrshoofer"
            ></Image>
            <span>در حال بارگذاری نقشه...</span>
          </div>
        )}
        {isOpen && (
          <MapComponent
            options={{
              mapKey: MAP_KEY,
              mapType: MapTypes.neshanPlaces,
              zoom: 15,
              isTouchPlatform: true,
              doubleClickZoom: true,
              dragPan: true,
              dragRotate: true,
              traffic: true,
              poi: true,
              trackResize: true,
              maxZoom: 19,
              minZoom: 5,
              mapTypeControllerStatus: {
                show: false,
              },
              mapTypeControllerOptions: {
                show: false,
              },
            }}
            mapSetter={mapSetter}
          />
        )}

        {/* Picker icon always in center of visible map */}

        {showPicker && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%", // Center vertically
              transform: "translate(-50%, -50%)", // Center both horizontally and vertically
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
                // Remove "bg-transparent" to use default background
                "text-base", // Prevent zoom on iOS by setting font-size to 16px minimum
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "", // Remove "bg-transparent"
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
              fontSize: '16px', // Prevent zoom on mobile
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchNeshan(e.target.value);
            }}
            onClick={() => {
              if (!showDropdown && search == null) setShowDropdown(true);
            }}
            onFocus={() => {
              // Prevent body scroll when input is focused on mobile
              if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
              }
            }}
            onBlur={() => {
              // Restore body scroll
              setTimeout(() => {
                document.body.style.overflow = '';
              }, 300);
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
                      if (window.neshanMapInstance) {
                        window.neshanMapInstance.setCenter([
                          item.location.x,
                          item.location.y,
                        ]);
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

        <div
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            width: "100vw",
            zIndex: 4000,
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
            padding: "16px 16px 12px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            className="w-full mb-2 py-6"
            variant="solid"
            color="warning"
            size="lg"
            onClick={handleSelectLocation}
          >
            انتخاب
          </Button>
        </div>
      </div>

      <Drawer
        isOpen={sheetIsOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          // Handle mobile keyboard when drawer opens/closes
          if (open) {
            document.body.classList.add('drawer-open');
            // Prevent zoom on mobile when drawer has inputs
            if (window.innerWidth <= 768) {
              const viewport = document.querySelector('meta[name="viewport"]');
              if (viewport) {
                viewport.setAttribute(
                  'content', 
                  'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
                );
              }
            }
          } else {
            document.body.classList.remove('drawer-open');
            // Restore viewport settings
            if (window.innerWidth <= 768) {
              const viewport = document.querySelector('meta[name="viewport"]');
              if (viewport) {
                viewport.setAttribute(
                  'content', 
                  'width=device-width, initial-scale=1.0'
                );
              }
            }
          }
          
          if (!open && lastMarkerRef.current) {
            lastMarkerRef.current.remove();
            lastMarkerRef.current = null;
            setShowPicker(true);
            setIsMoving(true);
            setTimeout(() => setIsMoving(false), 380);
            window.neshanMapInstance.zoomIn();
          }
        }}
        className="mobile-drawer-fix"
        placement="bottom"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex pb-2 justify-center">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">تایید مبدأ</h2>
                </div>
              </DrawerHeader>
              <DrawerBody className="gap-1">
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setIsSubmitting(true);
                    setErrorMessage("");

                    const data = new FormData(event.currentTarget);
                    data.set("tripId", trip.id);
                    data.set("lat", selectedCordinates.current.lat.toString());
                    data.set("lng", selectedCordinates.current.lng.toString());
                    data.set("address", selectedAddress);
                    data.set("phonenumber", numberPhone);
                    data.set("description", description);

                    try {
                      await UpdateLocation(data);
                      onClose();
                      setIsOpen(false);
                      // e.g., close Drawer or show success
                    } catch (error) {
                      setErrorMessage(
                        "خطا در اتصال به سرور، لطفاً دوباره امتحان کنید"
                      );
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {errorMessage && (
                    <p className="text-red-600 text-sm mb-2">{errorMessage}</p>
                  )}
                  <Textarea
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    placeholder="آدرس موقعیت شما"
                    label="آدرس"
                    labelPlacement="outside"
                    variant={"faded"}
                    maxRows={2}
                    disableAutosize
                    style={{
                      fontSize: '16px', // Prevent zoom on mobile
                    }}
                    onFocus={() => {
                      // Handle mobile keyboard focus
                      if (window.innerWidth <= 768) {
                        setTimeout(() => {
                          const element = document.activeElement;
                          if (element) {
                            element.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            });
                          }
                        }, 300);
                      }
                    }}
                  />

                  <p className="text-sm font-light mt-1">شماره تلفن</p>

                  <Input
                    defaultValue={trip.Passenger?.NumberPhone || ""}
                    variant="faded"
                    value={numberPhone}
                    onChange={(e) => setNumberPhone(e.target.value)}
                    style={{
                      fontSize: '16px', // Prevent zoom on mobile
                    }}
                    onFocus={() => {
                      // Handle mobile keyboard focus
                      if (window.innerWidth <= 768) {
                        setTimeout(() => {
                          const element = document.activeElement;
                          if (element) {
                            element.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            });
                          }
                        }, 300);
                      }
                    }}
                  />

                  <p className="text-sm font-light mt-1">
                    توضیحات
                    <span className="text-xs font-light ms-1"></span>
                  </p>

                  <Input
                    type="text"
                    placeholder="(اختیاری)"
                    variant="faded"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      fontSize: '16px', // Prevent zoom on mobile
                    }}
                    onFocus={() => {
                      // Handle mobile keyboard focus
                      if (window.innerWidth <= 768) {
                        setTimeout(() => {
                          const element = document.activeElement;
                          if (element) {
                            element.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            });
                          }
                        }, 300);
                      }
                    }}
                  />
                  <Button
                    variant={isSubmitting ? "faded" : "solid"}
                    color="secondary"
                    className="w-full mt-5 transition-all ease-linear duration-200"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "درحال ثبت مبدأ ..." : "تایید"}
                  </Button>
                </form>
              </DrawerBody>
              <DrawerFooter className="text-center mx-5 pt-0">
                <p className=" text-sm text-gray-500 font-extralight leading-tight">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 inline me-2 text-zinc-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                  در صورت نیاز تا قبل از شروع سفر‌، می‌توانید موقعیت انتخاب شده
                  را تعییر دهید
                </p>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default LocationSelector;
