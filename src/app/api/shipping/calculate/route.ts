import { NextResponse } from "next/server";

const ports = [
  // HIGH PRIORITY (EAST COAST - PRIMARY EUROPE ROUTES)
  { name: "Port of New York & New Jersey", lat: 40.6681, lng: -74.0451, priority: "high" },
  { name: "Port of Savannah", lat: 32.0809, lng: -81.0912, priority: "high" },
  { name: "Port of Norfolk (Virginia)", lat: 36.8508, lng: -76.2859, priority: "high" },
  { name: "Port of Charleston", lat: 32.7765, lng: -79.9311, priority: "high" },
  { name: "Port of Baltimore", lat: 39.2635, lng: -76.5790, priority: "high" },
  { name: "Port of Philadelphia", lat: 39.9526, lng: -75.1652, priority: "high" },
  { name: "Port of Wilmington (NC)", lat: 34.2257, lng: -77.9447, priority: "high" },
  { name: "Port of Boston", lat: 42.3601, lng: -71.0589, priority: "high" },
  { name: "Port of Jacksonville", lat: 30.3322, lng: -81.6557, priority: "high" },
  { name: "Port of Miami", lat: 25.7781, lng: -80.1794, priority: "high" },
  { name: "Port Everglades (Florida)", lat: 26.0900, lng: -80.1210, priority: "high" },

  // MEDIUM PRIORITY (GULF COAST - STRONG EXPORT HUBS)
  { name: "Port of Houston", lat: 29.7304, lng: -95.2655, priority: "medium" },
  { name: "Port of Beaumont", lat: 30.0802, lng: -94.1266, priority: "medium" },
  { name: "Port of New Orleans", lat: 29.9511, lng: -90.0715, priority: "medium" },
  { name: "Port of Mobile", lat: 30.6954, lng: -88.0399, priority: "medium" },
  { name: "Port of Gulfport", lat: 30.3674, lng: -89.0928, priority: "medium" },
  { name: "Port of Tampa Bay", lat: 27.9506, lng: -82.4572, priority: "medium" },

  // LOW PRIORITY (WEST COAST - INDIRECT TO EUROPE)
  { name: "Port of Los Angeles", lat: 33.7405, lng: -118.2775, priority: "low" },
  { name: "Port of Long Beach", lat: 33.7542, lng: -118.2167, priority: "low" },
  { name: "Port of Oakland", lat: 37.8044, lng: -122.2711, priority: "low" },
  { name: "Port of Seattle", lat: 47.6062, lng: -122.3321, priority: "low" },
  { name: "Port of Tacoma", lat: 47.2529, lng: -122.4443, priority: "low" },
  { name: "Port of San Diego", lat: 32.7157, lng: -117.1611, priority: "low" }
];

const sizeMultipliers: Record<string, number> = {
  "Sedan": 1,
  "Coupe": 1,
  "SUV": 1.2,
  "Van": 1.3,
  "Truck": 1.4,
  "Pickup": 1.4,
  "Luxury": 1.5,
  "Convertible": 1,
  "Wagon": 1.1,
  "Hatchback": 1
};

function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestPort(carLat: number, carLng: number) {
  let closest = ports[0];
  let minDistance = Infinity;
  for (const port of ports) {
    const distance = getDistanceMiles(carLat, carLng, port.lat, port.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closest = port;
    }
  }
  return { port: closest, distance: minDistance };
}

async function getUsdToEur() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR");
    const data = await res.json();
    return data.rates.EUR;
  } catch (e) {
    console.error("Exchange rate fetch failed", e);
    return 0.92; // Reliable fallback
  }
}

async function calculateTotal(price: number, lat?: number, lng?: number, bodyType?: string, method: "roro" | "container" = "roro") {
  let inlandTransport = 800;
  let oceanShippingBase = 1200;
  let portInfo = { name: "Default Port", distance: 0, priority: "high" };

  if (lat !== undefined && lng !== undefined) {
    const { port, distance } = findNearestPort(lat, lng);
    const ratePerMile = 1.2;
    inlandTransport = Math.min(Math.round(distance * ratePerMile), 2500);
    portInfo = { name: port.name, distance: Math.round(distance), priority: port.priority };
    oceanShippingBase = port.priority === "medium" ? 1600 : port.priority === "low" ? 2600 : 1200;
  }

  const multiplier = (bodyType && sizeMultipliers[bodyType]) || 1;
  const methodAdjustment = method === "container" ? 300 : 0;
  const oceanShippingFinal = Math.round(oceanShippingBase * multiplier + methodAdjustment);

  const duty = price * 0.10;
  const vat = (price + inlandTransport + oceanShippingFinal + duty) * 0.20;
  const otherFees = 1000;

  const totalUSD = price + inlandTransport + oceanShippingFinal + duty + vat + otherFees;

  // Real-time Exchange Rate
  const usdToEur = await getUsdToEur();
  const totalEUR = Math.round(totalUSD * usdToEur);

  return {
    basePrice: price,
    inlandTransport,
    oceanShipping: oceanShippingFinal,
    duty: Math.round(duty),
    vat: Math.round(vat),
    otherFees,
    total: Math.round(totalUSD),
    totalEUR,
    exchangeRate: usdToEur,
    port: portInfo.name,
    distance: portInfo.distance,
    priority: portInfo.priority,
    multiplier,
    method
  };
}

export async function POST(req: Request) {
  try {
    const { price, lat, lng, bodyType, method } = await req.json();
    if (price === undefined || price === null) return NextResponse.json({ error: "Price is required" }, { status: 400 });
    const result = await calculateTotal(price, lat, lng, bodyType, method);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 });
  }
}
