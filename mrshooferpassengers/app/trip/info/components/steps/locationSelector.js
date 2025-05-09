import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import polyline from "@mapbox/polyline";

const MAP_KEY = "web.629d398efe5a4b3d90b9d032569935a6";
const API_KEY = "service.6f5734c50a9c43cba6f43a6254c1b668";

let map, selectedMarker;
let currentAddress = "";
let isMoving = false;
let searchResults = [];
let showDropdown = false;

// --- 1. Create map container and UI elements ---
function createUI() {
  // Map container
  let mapDiv = document.getElementById("map");
  if (!mapDiv) {
    mapDiv = document.createElement("div");
    mapDiv.id = "map";
    mapDiv.style.width = "100vw";
    mapDiv.style.height = "100vh";
    mapDiv.style.position = "relative";
    document.body.appendChild(mapDiv);
  }

  // Picker
  let picker = document.getElementById("picker");
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "picker";
    picker.style.position = "absolute";
    picker.style.left = "50%";
    picker.style.top = "50%";
    picker.style.transform = "translate(-50%, -100%)";
    picker.style.transition = "transform 0.3s cubic-bezier(.4,2,.6,1)";
    picker.style.zIndex = "10";
    picker.style.pointerEvents = "none";
    picker.style.display = "flex";
    picker.style.flexDirection = "column";
    picker.style.alignItems = "center";
    picker.innerHTML = `
      <div style="background:white;color:#250ECD;padding:6px 16px;border-radius:8px;margin-bottom:8px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:16px;pointer-events:none;user-select:none;">
        مبدا را انتخاب کنید
      </div>
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;height:62px;width:48px;">
        <img src="/pin.png" alt="Pin" style="width:48px;height:48px;user-select:none;pointer-events:none;display:block;" />
        <div id="picker-shadow" style="width:14px;height:14px;background:rgba(128,128,128,0.5);border-radius:50%;position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);box-shadow:0 2px 8px rgba(0,0,0,0.15);pointer-events:none;display:flex;align-items:center;justify-content:center;">
          <span>
            <svg fill="#000FFFF" width="14px" height="14px" viewBox="0 0 19.70 14.00" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.0002">
              <g id="SVGRepo_iconCarrier">
                <path d="M7.8 10a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0-4.4 0z" />
              </g>
            </svg>
          </span>
        </div>
      </div>
    `;
    mapDiv.appendChild(picker);
  }

  // Search bar
  let searchDiv = document.getElementById("search-bar");
  if (!searchDiv) {
    searchDiv = document.createElement("div");
    searchDiv.id = "search-bar";
    searchDiv.style.position = "absolute";
    searchDiv.style.top = "16px";
    searchDiv.style.left = "50%";
    searchDiv.style.transform = "translateX(-50%)";
    searchDiv.style.zIndex = "1000";
    searchDiv.style.width = "90%";
    searchDiv.style.maxWidth = "400px";
    searchDiv.innerHTML = `
      <input id="search-input" type="text" placeholder="جستجو در نقشه..." style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;font-size:16px;outline:none;box-sizing:border-box;" />
      <div id="search-dropdown" style="display:none;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-height:250px;overflow-y:auto;margin-top:-2px;direction:rtl;"></div>
    `;
    mapDiv.appendChild(searchDiv);
  }

  // Address display
  let addressDiv = document.getElementById("address-display");
  if (!addressDiv) {
    addressDiv = document.createElement("div");
    addressDiv.id = "address-display";
    addressDiv.style.position = "absolute";
    addressDiv.style.left = "16px";
    addressDiv.style.top = "80px";
    addressDiv.style.zIndex = "1100";
    addressDiv.style.background = "#fff";
    addressDiv.style.borderRadius = "8px";
    addressDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    addressDiv.style.padding = "12px 16px";
    addressDiv.style.minWidth = "180px";
    addressDiv.style.maxWidth = "260px";
    addressDiv.style.color = "#222";
    addressDiv.style.fontSize = "15px";
    addressDiv.style.direction = "rtl";
    addressDiv.innerHTML = `
      <div style="font-weight:bold;margin-bottom:4px;">آدرس انتخاب شده:</div>
      <div id="address-value">...</div>
    `;
    mapDiv.appendChild(addressDiv);
  }

  // انتخاب button
  let selectBtnDiv = document.getElementById("select-btn-div");
  if (!selectBtnDiv) {
    selectBtnDiv = document.createElement("div");
    selectBtnDiv.id = "select-btn-div";
    selectBtnDiv.style.position = "absolute";
    selectBtnDiv.style.left = "16px";
    selectBtnDiv.style.bottom = "32px";
    selectBtnDiv.innerHTML = `<button id="select-btn">انتخاب</button>`;
    mapDiv.appendChild(selectBtnDiv);
  }
}

// --- 2. Initialize the map and all logic ---
function initMap() {
  map = new nmp_mapboxgl.Map({
    mapType: "neshanVector",
    container: "map",
    zoom: 15,
    center: [51.353441, 35.767757],
    mapKey: MAP_KEY,
    isTouchPlatform: true,
    doubleClickZoom: true,
    traffic: true,
    poi: true,
  });

  // Markers and popups
  new nmp_mapboxgl.Marker({ color: "purple" })
    .setLngLat([51.353441, 35.767757])
    .addTo(map);

  const popup = new nmp_mapboxgl.Popup({ offset: 25 }).setText(
    "با نگه داشتن مارکر می‌توانید آن را روی نقشه جابه‌جا کنید"
  );
  new nmp_mapboxgl.Marker({ color: "#00F955", draggable: true })
    .setPopup(popup)
    .setLngLat([51.4055941, 35.70019216])
    .addTo(map)
    .togglePopup();

  // GeoJSON features
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [51.338057, 35.699736] },
        properties: {
          title: "میدان آزادی",
          description: "نمایش مارکر با آیکون اختصاصی <br/> مختصات:<br/> [51.338057 , 35.699736]",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [51.375265, 35.74472] },
        properties: {
          title: "برج میلاد",
          description: "مختصات:<br/> [51.375265 , 35.744720]",
        },
      },
    ],
  };
  for (const feature of geojson.features) {
    new nmp_mapboxgl.Marker()
      .setLngLat(feature.geometry.coordinates)
      .setPopup(
        new nmp_mapboxgl.Popup({ offset: 40 }).setHTML(
          `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
        )
      )
      .addTo(map)
      .togglePopup();
  }

  // Polyline/route
  const exampleResponse = {
    routes: [
      {
        overview_polyline: { points: "cy{xEa{sxHCyEr@}FIi@MWi@Um@L[l@A^{Jr@" },
        legs: [
          {
            summary: "میدان انقلاب اسلامی - کارگر شمالی",
            distance: { value: 555.0, text: "۵۷۵ متر" },
            duration: { value: 99.0, text: "۲ دقیقه" },
            steps: [
              {
                name: "آزادی",
                instruction: "در جهت شرق در آزادی قرار بگیرید",
                bearing_after: 88,
                type: "depart",
                distance: { value: 197.0, text: "۲۰۰ متر" },
                duration: { value: 35.0, text: "۱ دقیقه" },
                polyline: "cy{xEa{sxHAkBAmBDa@BKHs@BWD]J{@",
                start_location: [51.388811, 35.70082],
              },
              {
                name: "کارگر شمالی",
                bearing_after: 111,
                type: "rotary",
                modifier: "straight",
                exit: 3,
                distance: { value: 146.0, text: "۱۵۰ متر" },
                duration: { value: 38.0, text: "۱ دقیقه" },
                polyline: "}w{xEohtxHDSBUCUESEKGKSOUEW@UJORKXAN?N",
                start_location: [51.390956, 35.700632],
              },
              {
                name: "",
                instruction: "به مسیر خود ادامه دهید",
                bearing_after: 354,
                type: "exit rotary",
                modifier: "right",
                exit: 3,
                distance: { value: 212.0, text: "۲۲۵ متر" },
                duration: { value: 39.0, text: "۱ دقیقه" },
                polyline: "a|{xEuitxH_ADaBLO@{BRmAH",
                start_location: [51.391154, 35.701293],
              },
              {
                name: "کارگر شمالی",
                instruction: "در مقصد قرار دارید",
                bearing_after: 0,
                type: "arrive",
                distance: { value: 0.0, text: "" },
                duration: { value: 0.0, text: "" },
                polyline: "}g|xEahtxH",
                start_location: [51.390885, 35.703188],
              },
            ],
          },
        ],
      },
    ],
  };

  const routes = [];
  const points = [];
  for (let k = 0; k < exampleResponse.routes.length; k++) {
    for (let j = 0; j < exampleResponse.routes[k].legs.length; j++) {
      for (let i = 0; i < exampleResponse.routes[k].legs[j].steps.length; i++) {
        const step = exampleResponse.routes[k].legs[j].steps[i]["polyline"];
        const point = exampleResponse.routes[k].legs[j].steps[i]["start_location"];
        const route = polyline.decode(step, 5);
        route.map((item) => item.reverse());
        routes.push(route);
        points.push(point);
      }
    }
  }
  const routeObj = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "MultiLineString", coordinates: routes },
      },
    ],
  };
  const pointsObj = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "MultiPoint", coordinates: points },
      },
    ],
  };

  map.on("load", function () {
    map.addSource("route", { type: "geojson", data: routeObj });
    map.addSource("points1", { type: "geojson", data: pointsObj });
    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#250ECD", "line-width": 9 },
    });
    map.addLayer({
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
  });

  // Map events
  map.on("zoom", () => {});
  map.on("movestart", () => {
    isMoving = true;
    document.getElementById("picker").style.transform = "translate(-50%, -115%)";
  });
  map.on("moveend", async () => {
    isMoving = false;
    document.getElementById("picker").style.transform = "translate(-50%, -100%)";
    const center = map.getCenter();
    currentAddress = await getAddressFromNeshan(center.lat, center.lng);
    document.getElementById("address-value").innerText = currentAddress;
  });
}

// --- 3. Address search and reverse geocoding ---
async function getAddressFromNeshan(lat, lng) {
  const url = `https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`;
  const response = await fetch(url, { headers: { "Api-Key": API_KEY } });
  const data = await response.json();
  return data.formatted_address || "آدرس پیدا نشد";
}

// --- 4. Search functionality ---
async function searchNeshan(query) {
  if (!query) {
    searchResults = [];
    showDropdown = false;
    renderDropdown();
    return;
  }
  const url = `https://api.neshan.org/v1/search?term=${encodeURIComponent(query)}&lat=35.6892&lng=51.3890`;
  const response = await fetch(url, { headers: { "Api-Key": API_KEY } });
  const data = await response.json();
  searchResults = data.items || [];
  showDropdown = true;
  renderDropdown();
}

// --- 5. Render search dropdown ---
function renderDropdown() {
  const dropdown = document.getElementById("search-dropdown");
  if (!showDropdown || searchResults.length === 0) {
    dropdown.style.display = "none";
    dropdown.innerHTML = `<div style="padding:12px;color:#888;text-align:center;">نتیجه ای یافت نشد</div>`;
    return;
  }
  dropdown.style.display = "block";
  dropdown.innerHTML = searchResults
    .map(
      (item) => `
      <div style="padding:10px;cursor:pointer;border-bottom:1px solid #f0f0f0;" onclick="window.selectSearchResult('${item.title}',${item.location.x},${item.location.y})">
        <div style="font-weight:bold;">${item.title}</div>
        <div style="font-size:13px;color:#888;">${item.address}</div>
        ${
          item.type
            ? `<div style="font-size:14px;color:#2196f3;margin-top:2px;display:flex;align-items:center;gap:6px;">
                <span>${getTypeIcon(item.type)}</span>
                <span>نوع: ${item.type}</span>
              </div>`
            : ""
        }
      </div>
    `
    )
    .join("");
}

// --- 6. Handle search result click ---
window.selectSearchResult = (title, x, y) => {
  showDropdown = false;
  document.getElementById("search-input").value = title;
  searchResults = [];
  renderDropdown();
  map.setCenter([x, y]);
  map.setZoom(17);
  searchNeshan(title);
};

// --- 7. انتخاب button logic ---
async function onSelectButtonClick() {
  if (!map) return;
  isMoving = true;
  setTimeout(() => (isMoving = false), 300);

  const center = map.getCenter();
  const address = await getAddressFromNeshan(center.lat, center.lng);

  // Remove previous marker if exists
  if (selectedMarker) selectedMarker.remove();

  // Create a marker element with address and pin
  const el = document.createElement("div");
  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.background = "none";
  el.style.pointerEvents = "none";
  el.style.position = "relative";

  // Address box
  const addressDiv = document.createElement("div");
  addressDiv.innerText = "مبدا سفر";
  addressDiv.style.background = "white";
  addressDiv.style.color = "#250ECD";
  addressDiv.style.padding = "3px 8px";
  addressDiv.style.borderRadius = "8px";
  addressDiv.style.marginBottom = "7px";
  addressDiv.style.fontWeight = "normal";
  addressDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
  addressDiv.style.fontSize = "14px";
  addressDiv.style.pointerEvents = "auto";
  addressDiv.style.userSelect = "text";
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

  selectedMarker = new nmp_mapboxgl.Marker(el, {
    anchor: "bottom",
    offset: [0, -7],
  })
    .setLngLat([center.lng, center.lat])
    .addTo(map);
}

// --- 8. Get icon for type ---
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

// --- 9. Attach event listeners ---
function attachEvents() {
  document.getElementById("search-input").addEventListener("input", (e) => {
    searchNeshan(e.target.value);
  });
  document.getElementById("search-input").addEventListener("focus", (e) => {
    if (e.target.value) {
      showDropdown = true;
      renderDropdown();
    }
  });
  document.getElementById("select-btn").addEventListener("click", onSelectButtonClick);
}

// --- 10. Initialize everything on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  createUI();
  initMap();
  attachEvents();
});