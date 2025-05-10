"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import polyline from "@mapbox/polyline";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

const MAP_KEY =
  process.env.NEXT_PUBLIC_NESHAN_MAP_KEY ||
  "web.629d398efe5a4b3d90b9d032569935a6";
const API_KEY =
  process.env.NEXT_PUBLIC_NESHAN_API_KEY ||
  "service.6f5734c50a9c43cba6f43a6254c1b668";

function LocationSelector({ isOpen }) {
  const [isMoving, setIsMoving] = useState(false);
  const [zoom, setZoom] = useState(11);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const selectedMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);

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
      neshanMap.addSource("route", {
        type: "geojson",
        data: routeObj,
      });
      neshanMap.addSource("points1", {
        type: "geojson",
        data: pointsObj,
      });

      neshanMap.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#250ECD",
          "line-width": 9,
        },
      });

      neshanMap.addLayer({
        id: "points1",
        type: "circle",
        source: "points1",
        paint: {
          "circle-color": "#9fbef9",
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2,
          "circle-radius": 5,
        },
      });

      setLoading(false); // Hide loading when map is ready
    });

    neshanMap.on("zoom", () => {
      setZoom(neshanMap.getZoom());
    });

    neshanMap.on("movestart", () => {
      setIsMoving(true);
    });
    neshanMap.on("moveend", async () => {
      setIsMoving(false);
      const center = neshanMap.getCenter();
      const address = await getAddressFromNeshan(center.lat, center.lng);
      setCurrentAddress(address);
    });
  };

  // Resize map when modal opens
  useEffect(() => {
    if (isOpen && window.neshanMapInstance) {
      setTimeout(() => {
        window.neshanMapInstance.resize();
      }, 50);
    }
  }, [isOpen]);

  // Add this effect - it will force the map to resize multiple times
  useEffect(() => {
    if (isOpen) {
      const timers = [];
      // Force multiple resize attempts at different intervals
      [100, 300].forEach((delay) => {
        timers.push(
          setTimeout(() => {
            if (window.neshanMapInstance) {
              window.neshanMapInstance.resize();
            }
          }, delay)
        );
      });

      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen]);

  // Add this final method - it will ensure the map is fully rendered
  useEffect(() => {
    if (isOpen) {
      // Create a complete initialization function
      const forceMapRender = () => {
        if (window.neshanMapInstance) {
          // METHOD 1: Basic resize
          window.neshanMapInstance.resize();

          // METHOD 2: Force reflow
          window.neshanMapInstance._update();

          // METHOD 3: Trigger repaint (internal method)
          if (window.neshanMapInstance._render) {
            window.neshanMapInstance._render();
          }

          // METHOD 4: Force style recalculation
          window.neshanMapInstance.getCanvas().style.visibility = "hidden";
          setTimeout(() => {
            if (
              window.neshanMapInstance &&
              window.neshanMapInstance.getCanvas()
            ) {
              window.neshanMapInstance.getCanvas().style.visibility = "visible";

              // METHOD 5: Nudge the center to force a redraw
              try {
                const center = window.neshanMapInstance.getCenter();
                window.neshanMapInstance.jumpTo({
                  center: [center.lng, center.lat],
                });
              } catch (e) {
                console.log("Map center adjustment failed", e);
              }
            }
          }, 50);
        }
      };

      // Call multiple times with increasing delays
      // const delays = [50, 200, 500, 1000];
      // const timers = delays.map((delay) =>
      //   setTimeout(() => forceMapRender(), delay)
      // );

      // Also trigger on window resize
      window.addEventListener("resize", forceMapRender);

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
  //       el.style.background = "#2196f3";
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

  async function getAddressFromNeshan(lat, lng) {
    const url = `https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`;
    const response = await fetch(url, {
      headers: {
        "Api-Key": API_KEY,
      },
    });
    const data = await response.json();
    return data.formatted_address || "آدرس پیدا نشد";
  }

  async function searchNeshan(query) {
    if (!query) {
      setResults([]);
      return;
    }
    const url = `https://api.neshan.org/v1/search?term=${encodeURIComponent(
      query
    )}&lat=35.6892&lng=51.3890`;
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

  const handleSelectLocation = async () => {
    if (window.neshanMapInstance) {
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), 300);

      const center = window.neshanMapInstance.getCenter();

      // Get address from Neshan
      const address = await getAddressFromNeshan(center.lat, center.lng);

      // Remove previous marker if exists
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
      }

      // Create a marker element with address and pin
      const el = document.createElement("div");
      el.style.display = "flex";
      el.style.flexDirection = "column";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.background = "none";
      el.style.pointerEvents = "none";
      el.style.position = "relative";

      // Address box (styled like your picker)
      const addressDiv = document.createElement("div");
      addressDiv.innerText = "مبدأ سفر";
      addressDiv.style.background = "white";
      addressDiv.style.color = "#250ECD";
      addressDiv.style.padding = "3px 6px";
      addressDiv.style.borderRadius = "8px";
      addressDiv.style.marginBottom = "7px";
      addressDiv.style.fontWeight = "normal";
      addressDiv.style.fontFamily = "Vazir";
      addressDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
      addressDiv.style.fontSize = "16px";
      addressDiv.style.pointerEvents = "auto";
      addressDiv.style.userSelect = "text";
      addressDiv.style.border = "2px solid #FFD600"; // Add yellow border
      el.appendChild(addressDiv);

      // Pin image
      const img = document.createElement("img");
      img.src = "/pin.png";
      img.alt = "Pin";
      img.style.width = "48px";
      img.style.height = "48px";
      img.style.userSelect = "none";
      img.style.pointerEvents = "none";
      el.appendChild(img);

      const marker = new nmp_mapboxgl.Marker(el, {
        anchor: "bottom",
        offset: [0, -7],
      })
        .setLngLat([center.lng, center.lat])
        .addTo(window.neshanMapInstance);

      selectedMarkerRef.current = marker;
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full h-full"
      style={{ position: "relative" }}
    >
      {/* Map area */}
      <div
        style={{
          flex: "1 1 0%",
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
          paddingBottom: "110px", // Add padding so map content isn't hidden by the fixed button
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
              background: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            <Image
              src="/mrshoofer_logo_full.png"
              width={190}
              height={40}
              alt="mrshoofer"
            ></Image>
            در حال بارگذاری نقشه...
          </div>
        )}
        {isOpen && (
          <MapComponent
            options={{
              mapKey: MAP_KEY,
              mapType: MapTypes.neshanPlaces,
              zoom: 15,
              center: [51.353441, 35.767757],
              isTouchPlatform: true,
              doubleClickZoom: true,
              dragPan: true,
              dragRotate: true,
              traffic: true,
              poi: true,
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

        {/* Picker icon always in center */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: isMoving
              ? "translate(-50%, -107%)"
              : "translate(-50%, -93%)",
            transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
            zIndex: 10,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              color: "#250ECD",
              padding: "3px 7px",
              borderRadius: "9px",
              marginBottom: "8px",
              fontWeight: "normal",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontSize: "14px",
              pointerEvents: "none",
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
            <img
              src="/pin.png"
              alt="Pin"
              style={{
                width: "48px",
                height: "48px",
                userSelect: "none",
                pointerEvents: "none",
                display: "block",
              }}
            />
            {isMoving && (
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  background: "rgba(128,128,128,0.5)",
                  borderRadius: "50%",
                  position: "absolute",
                  left: "50%",
                  bottom: "-6px",
                  transform: "translateX(-50%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>
                  <svg
                    fill="#000FFFF"
                    width="14px"
                    height="14px"
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
            )}
          </div>
        </div>

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
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchNeshan(e.target.value);
            }}
            onFocus={() => search && setShowDropdown(true)}
            placeholder="جستجو در نقشه..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {showDropdown && (
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
                        window.neshanMapInstance.setZoom(17);
                      }
                      searchNeshan(item.title);
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{item.title}</div>
                    <div style={{ fontSize: "13px", color: "#888" }}>
                      {item.address}
                    </div>
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
                        <span>نوع: {item.type}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom controls: Button and Address Card */}
      <div
        className="w-full px-3 pb-4 pt-2 bg-white/90"
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100vw",
          zIndex: 4000,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <Card className="mb-3">
          <CardBody dir="rtl" className="text-start">
           <lable>
            آدرس انتخاب شده
            </lable>
            <div>{currentAddress || "..."}</div>
          </CardBody>
        </Card>
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
  );
}

export default LocationSelector;
