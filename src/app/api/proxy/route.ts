import { NextResponse } from 'next/server';

const BASE_URL = 'https://mc-api.marketcheck.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }

  // Extract other query params to forward
  const forwardParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      forwardParams.append(key, value);
    }
  });

  // Attach API Key
  const apiKey = process.env.MARKETCHECK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key configuration' }, { status: 500 });
  }
  forwardParams.append('api_key', apiKey);

  const url = `${BASE_URL}${endpoint}?${forwardParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch from Marketcheck API' }, { status: 500 });
  }
}
