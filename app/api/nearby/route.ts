import { NextRequest, NextResponse } from "next/server";

const OVERPASS_SERVERS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid coordinates",
      },
      { status: 400 }
    );
  }

  const query = `
[out:json][timeout:20];

(
  node["amenity"="hospital"](around:8000,${lat},${lon});
  node["amenity"="police"](around:8000,${lat},${lon});
  node["office"="government"](around:8000,${lat},${lon});
  node["amenity"="shelter"](around:8000,${lat},${lon});
  node["social_facility"="shelter"](around:8000,${lat},${lon});
  node["amenity"="community_centre"](around:8000,${lat},${lon});

  way["amenity"="hospital"](around:8000,${lat},${lon});
  way["amenity"="police"](around:8000,${lat},${lon});
  way["office"="government"](around:8000,${lat},${lon});
  way["amenity"="shelter"](around:8000,${lat},${lon});
  way["social_facility"="shelter"](around:8000,${lat},${lon});
  way["amenity"="community_centre"](around:8000,${lat},${lon});
);

out center tags;
`;

  let lastError = "Unknown Overpass error";

  for (const server of OVERPASS_SERVERS) {
    try {
      console.log(`Trying Overpass: ${server}`);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 25000);

      const response = await fetch(server, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          "User-Agent":
            "DisasterManagementApp/1.0",
        },

        body: `data=${encodeURIComponent(query)}`,

        signal: controller.signal,

        /*
         * Don't let Next.js cache every request forever.
         */
        cache: "no-store",
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();

        lastError = `Overpass ${response.status}`;

        console.error(
          `${server} returned ${response.status}`,
          text.slice(0, 300)
        );

        continue;
      }

      const data = await response.json();

      return NextResponse.json(
        {
          success: true,
          elements: Array.isArray(data?.elements)
            ? data.elements
            : [],
        },
        {
          status: 200,

          /*
           * Browser/CDN can reuse the response for a short time.
           * This greatly reduces repeated Overpass requests.
           */
          headers: {
            "Cache-Control":
              "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    } catch (error) {
      lastError =
        error instanceof Error
          ? error.message
          : "Overpass request failed";

      console.error(
        `Overpass server failed: ${server}`,
        error
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      error:
        "Nearby service provider is temporarily busy",
      details: lastError,
    },
    { status: 503 }
  );
}