import { NextResponse } from "next/server";

const ports = [
  // EAST COAST (PRIMARY FOR EUROPE)
  { name: "Port of New York & New Jersey", lat: 40.6681, lng: -74.0451 },
  { name: "Port of Savannah", lat: 32.0809, lng: -81.0912 },
  { name: "Port of Virginia (Norfolk)", lat: 36.8508, lng: -76.2859 },
  { name: "Port of Charleston", lat: 32.7765, lng: -79.9311 },
  { name: "Port of Baltimore", lat: 39.2635, lng: -76.5790 },
  { name: "Port of Philadelphia", lat: 39.9526, lng: -75.1652 },
  { name: "Port of Miami", lat: 25.7781, lng: -80.1794 },
  { name: "Port of Jacksonville", lat: 30.3322, lng: -81.6557 },
  { name: "Port of Boston", lat: 42.3601, lng: -71.0589 },

  // GULF COAST (STRONG EXPORT HUBS TO EUROPE)
  { name: "Port of Houston", lat: 29.7304, lng: -95.2655 },
  { name: "Port of New Orleans", lat: 29.9511, lng: -90.0715 },
  { name: "Port of Mobile", lat: 30.6954, lng: -88.0399 },
  { name: "Port of Tampa Bay", lat: 27.9506, lng: -82.4572 },

  // WEST COAST (INDIRECT ROUTES TO EUROPE VIA PANAMA)
  { name: "Port of Los Angeles", lat: 33.7405, lng: -118.2775 },
  { name: "Port of Long Beach", lat: 33.7542, lng: -118.2167 },
  { name: "Port of Oakland", lat: 37.8044, lng: -122.2711 },
  { name: "Port of Seattle", lat: 47.6062, lng: -122.3321 }
];

function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
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

function calculateTotal(price: number, lat?: number, lng?: number) {
  let inlandTransport = 800; // Fallback
  let portInfo = { name: "Default Port", distance: 0 };

  if (lat !== undefined && lng !== undefined) {
    const { port, distance } = findNearestPort(lat, lng);
    const ratePerMile = 1.2;
    inlandTransport = Math.round(distance * ratePerMile);
    portInfo = { name: port.name, distance: Math.round(distance) };
  }

  const oceanShipping = 1200;
  const duty = price * 0.10;
  const vat = (price + inlandTransport + oceanShipping + duty) * 0.20;
  const otherFees = 1000;

  const total = price + inlandTransport + oceanShipping + duty + vat + otherFees;

  return {
    basePrice: price,
    inlandTransport,
    oceanShipping,
    duty: Math.round(duty),
    vat: Math.round(vat),
    otherFees,
    total: Math.round(total),
    port: portInfo.name,
    distance: portInfo.distance
  };
}

export async function POST(req: Request) {
  try {
    const { price, lat, lng } = await req.json();

    if (price === undefined || price === null) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 });
    }

    const result = calculateTotal(price, lat, lng);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 });
  }
}
