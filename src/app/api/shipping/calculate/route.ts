import { NextResponse } from "next/server";

function calculateTotal(price: number) {
  const inlandTransport = 800; // fake fixed value for now
  const oceanShipping = 1200;
  const duty = price * 0.10;
  const vat = (price + inlandTransport + oceanShipping + duty) * 0.20;
  const otherFees = 1000;

  const total =
    price +
    inlandTransport +
    oceanShipping +
    duty +
    vat +
    otherFees;

  return {
    basePrice: price,
    inlandTransport,
    oceanShipping,
    duty,
    vat,
    otherFees,
    total
  };
}

export async function POST(req: Request) {
  try {
    const { price } = await req.json();

    if (price === undefined || price === null) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 });
    }

    const result = calculateTotal(price);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 });
  }
}
