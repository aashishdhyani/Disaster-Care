"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  Hospital,
  Shield,
  Home,
  Navigation2,
  Phone,
  LocateFixed,
  AlertTriangle,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

/* =========================================================
   LEAFLET ICON FIX
========================================================= */

const useFixLeafletIcons = () => {
  useEffect(() => {
    delete (
      L.Icon.Default.prototype as unknown as {
        _getIconUrl?: unknown;
      }
    )._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",

      iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",

      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);
};

/* =========================================================
   DYNAMIC LEAFLET IMPORTS
========================================================= */

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  {
    ssr: false,
  }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  {
    ssr: false,
  }
);

/* =========================================================
   MAP ICONS
========================================================= */

const hospitalIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const policeIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const shelterIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/1946/1946436.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

/* =========================================================
   TYPES
========================================================= */

type PlaceType =
  | "hospital"
  | "police"
  | "shelter"
  | "other";

interface OverpassTags {
  name?: string;
  amenity?: string;
  office?: string;
  social_facility?: string;
  phone?: string;

  [key: string]: string | undefined;
}

interface OverpassElement {
  id?: number;
  type?: string;

  // Node coordinates
  lat?: number;
  lon?: number;

  // Way/relation center coordinates
  center?: {
    lat?: number;
    lon?: number;
  };

  tags?: OverpassTags;
}

/* Normalized place used by the UI */
interface NormalizedPlace extends OverpassElement {
  lat: number;
  lon: number;
}

/* =========================================================
   FILTERS
========================================================= */

const FILTERS: {
  key: "all" | PlaceType;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    key: "all",
    label: "All",
    icon: LocateFixed,
  },
  {
    key: "hospital",
    label: "Hospitals",
    icon: Hospital,
  },
  {
    key: "police",
    label: "Police",
    icon: Shield,
  },
  {
    key: "shelter",
    label: "Shelters",
    icon: Home,
  },
];

/* =========================================================
   GET PLACE TYPE
========================================================= */

function getType(tags?: OverpassTags): PlaceType {
  if (tags?.amenity === "hospital") {
    return "hospital";
  }

  if (
    tags?.amenity === "police" ||
    tags?.office === "government"
  ) {
    return "police";
  }

  if (
    tags?.amenity === "shelter" ||
    tags?.social_facility === "shelter" ||
    tags?.amenity === "community_centre"
  ) {
    return "shelter";
  }

  return "other";
}

/* =========================================================
   GET ICON
========================================================= */

function getIcon(tags?: OverpassTags) {
  const type = getType(tags);

  if (type === "hospital") {
    return hospitalIcon;
  }

  if (type === "police") {
    return policeIcon;
  }

  if (type === "shelter") {
    return shelterIcon;
  }

  return userIcon;
}

/* =========================================================
   TYPE LABEL
========================================================= */

function typeLabel(type: PlaceType) {
  if (type === "hospital") {
    return "Hospital";
  }

  if (type === "police") {
    return "Police / Government";
  }

  if (type === "shelter") {
    return "Shelter";
  }

  return "Facility";
}

/* =========================================================
   SAFE COORDINATES
========================================================= */

/*
  This is the main fix for:

  Invalid LatLng object: (undefined, undefined)

  Overpass can return:

  node:
    lat
    lon

  OR:

  way:
    center.lat
    center.lon

  We normalize both into lat/lon.
*/

function getCoordinates(
  place: OverpassElement
): [number, number] | null {
  const lat = place.lat ?? place.center?.lat;
  const lon = place.lon ?? place.center?.lon;

  if (
    typeof lat !== "number" ||
    typeof lon !== "number"
  ) {
    return null;
  }

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {
    return null;
  }

  // Valid latitude range
  if (lat < -90 || lat > 90) {
    return null;
  }

  // Valid longitude range
  if (lon < -180 || lon > 180) {
    return null;
  }

  return [lat, lon];
}

/* =========================================================
   NORMALIZE OVERPASS DATA
========================================================= */

function normalizePlaces(
  elements: OverpassElement[]
): NormalizedPlace[] {
  return elements
    .map((place) => {
      const coordinates = getCoordinates(place);

      if (!coordinates) {
        return null;
      }

      return {
        ...place,
        lat: coordinates[0],
        lon: coordinates[1],
      };
    })
    .filter(
      (
        place
      ): place is NormalizedPlace => place !== null
    );
}

/* =========================================================
   DISTANCE
========================================================= */

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat =
    (lat2 - lat1) * (Math.PI / 180);

  const dLon =
    (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

/* =========================================================
   OVERPASS SERVERS
========================================================= */

const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

/* =========================================================
   FETCH PLACES
========================================================= */

async function fetchPlacesFromOverpass(
  lat: number,
  lon: number
): Promise<NormalizedPlace[]> {
  try {
    const response = await fetch(
      `/api/nearby?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Failed to load nearby services"
      );
    }

    const elements = Array.isArray(
      data?.elements
    )
      ? data.elements
      : [];

    return normalizePlaces(elements);
  } catch (error) {
    console.error(
      "Nearby services error:",
      error
    );

    throw error;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

const LiveMap: React.FC = () => {
  useFixLeafletIcons();

  const [position, setPosition] =
    useState<[number, number] | null>(null);

  const [places, setPlaces] =
    useState<NormalizedPlace[]>([]);

  const [filter, setFilter] =
    useState<"all" | PlaceType>("all");

  const [loading, setLoading] =
    useState(true);

  const [fetchError, setFetchError] =
    useState(false);

  const [usedFallbackLocation, setUsedFallbackLocation] =
    useState(false);

  /* =======================================================
     LOAD USER LOCATION
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const fallback: [number, number] = [
      28.6139,
      77.209,
    ];

    if (!navigator.geolocation) {
      if (!cancelled) {
        setPosition(fallback);
        setUsedFallbackLocation(true);
      }

      loadPlaces(fallback);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;

        const latitude =
          pos.coords.latitude;

        const longitude =
          pos.coords.longitude;

        /*
          Extra safety check.
        */

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          setPosition(fallback);
          setUsedFallbackLocation(true);
          loadPlaces(fallback);
          return;
        }

        const coords: [
          number,
          number
        ] = [
          latitude,
          longitude,
        ];

        setPosition(coords);
        setUsedFallbackLocation(false);

        loadPlaces(coords);
      },

      () => {
        if (cancelled) return;

        setPosition(fallback);
        setUsedFallbackLocation(true);

        loadPlaces(fallback);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     LOAD PLACES
  ======================================================= */

  const loadPlaces = async (
    coords: [number, number]
  ) => {
    setLoading(true);
    setFetchError(false);

    try {
      const data =
        await fetchPlacesFromOverpass(
          coords[0],
          coords[1]
        );

      setPlaces(data);
    } catch (error) {
      console.error(
        "MAP FETCH ERROR:",
        error
      );

      setPlaces([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredPlaces =
    useMemo(() => {
      if (!position) {
        return [];
      }

      return places
        .filter((place) => {
          if (filter === "all") {
            return true;
          }

          return (
            getType(place.tags) === filter
          );
        })
        .map((place) => {
          const distance =
            getDistance(
              position[0],
              position[1],
              place.lat,
              place.lon
            );

          return {
            ...place,
            distance,
          };
        })
        .sort(
          (a, b) =>
            a.distance - b.distance
        );
    }, [
      places,
      filter,
      position,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex flex-col gap-4">

      {/* ===================================================
          FILTER BUTTONS
      =================================================== */}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(
          ({
            key,
            label,
            icon: Icon,
          }) => (
            <button
              key={key}
              onClick={() =>
                setFilter(key)
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 focus-ring",

                filter === key
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />

              {label}
            </button>
          )
        )}
      </div>

      {/* ===================================================
          FALLBACK LOCATION WARNING
      =================================================== */}

      {usedFallbackLocation && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />

          Couldn&apos;t access your location —
          showing a default area instead.
        </div>
      )}

      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="grid gap-4 lg:grid-cols-5">

        {/* =================================================
            MAP
        ================================================= */}

        <Card className="overflow-hidden p-0 lg:col-span-3">

          <div className="relative h-[420px] w-full sm:h-[480px]">

            {/* Loading */}
            {loading && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-950/70">
                <LoadingSpinner label="Locating nearby help…" />
              </div>
            )}

            {/* Map */}
            {position && (
              <MapContainer
                center={position}
                zoom={13}
                className="h-full w-full"
              >

                {/* OpenStreetMap */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />

                {/* =========================================
                    USER LOCATION
                ========================================= */}

                <Marker
                  position={position}
                  icon={userIcon}
                >
                  <Popup>
                    <div className="min-w-[140px] p-3">
                      <p className="font-semibold text-slate-900">
                        You are here
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Your current location
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* =========================================
                    NEARBY PLACES
                ========================================= */}

                {filteredPlaces.map(
                  (place, index) => {

                    /*
                      FINAL SAFETY CHECK

                      Even though places were already
                      normalized, we verify again before
                      creating a Leaflet Marker.
                    */

                    if (
                      !Number.isFinite(
                        place.lat
                      ) ||
                      !Number.isFinite(
                        place.lon
                      )
                    ) {
                      return null;
                    }

                    const type =
                      getType(
                        place.tags
                      );

                    const distance =
                      place.distance;

                    const markerKey =
                      place.id ??
                      `${place.lat}-${place.lon}-${index}`;

                    return (
                      <Marker
                        key={markerKey}
                        position={[
                          place.lat,
                          place.lon,
                        ]}
                        icon={getIcon(
                          place.tags
                        )}
                      >

                        <Popup>

                          <div className="min-w-[190px] p-3">

                            {/* Name */}
                            <h3 className="font-bold text-slate-900">
                              {place.tags
                                ?.name ||
                                "Unknown Location"}
                            </h3>

                            {/* Type */}
                            <p className="mt-0.5 text-xs font-medium text-brand-600">
                              {typeLabel(
                                type
                              )}
                            </p>

                            {/* Distance */}
                            <p className="mt-1 text-xs text-slate-500">
                              {distance.toFixed(
                                2
                              )}{" "}
                              km away
                            </p>

                            {/* Navigate */}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${position[0]},${position[1]}&destination=${place.lat},${place.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                            >
                              <Navigation2 className="h-3.5 w-3.5" />

                              Navigate
                            </a>

                            {/* Call */}
                            {place.tags
                              ?.phone && (
                              <a
                                href={`tel:${place.tags.phone}`}
                                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-900"
                              >
                                <Phone className="h-3.5 w-3.5" />

                                Call
                              </a>
                            )}

                          </div>

                        </Popup>

                      </Marker>
                    );
                  }
                )}

              </MapContainer>
            )}

          </div>

        </Card>

        {/* =================================================
            NEARBY SERVICES LIST
        ================================================= */}

        <div className="lg:col-span-2">

          {/* Error */}
          {fetchError && (
            <EmptyState
              tone="error"
              icon={
                <AlertTriangle className="h-5 w-5" />
              }
              title="Couldn't load nearby services"
              description="The map data provider didn't respond. Please try again."

              action={
                position && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      loadPlaces(
                        position
                      )
                    }
                  >
                    Retry
                  </Button>
                )
              }
            />
          )}

          {/* No results */}
          {!fetchError &&
            !loading &&
            filteredPlaces.length === 0 && (
              <EmptyState
                icon={
                  <LocateFixed className="h-5 w-5" />
                }
                title="No nearby services found"
                description="Try a different filter, or check back once you have a network connection."
              />
            )}

          {/* Results */}
          {!fetchError &&
            filteredPlaces.length > 0 && (
              <div className="flex max-h-[480px] flex-col gap-2.5 overflow-y-auto pr-1">

                {filteredPlaces
                  .slice(0, 12)
                  .map(
                    (
                      place,
                      index
                    ) => {

                      const type =
                        getType(
                          place.tags
                        );

                      return (
                        <Card
                          key={
                            place.id ??
                            `${place.lat}-${place.lon}-${index}`
                          }
                          hover
                          className="p-3.5"
                        >

                          <div className="flex items-start justify-between gap-3">

                            {/* Info */}
                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {place.tags
                                  ?.name ||
                                  "Unknown Location"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {typeLabel(
                                  type
                                )}{" "}
                                ·{" "}
                                {place.distance.toFixed(
                                  1
                                )}{" "}
                                km
                              </p>

                            </div>

                            {/* Navigation */}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${position?.[0]},${position?.[1]}&destination=${place.lat},${place.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition hover:bg-brand-600 hover:text-white dark:bg-brand-500/10 dark:text-brand-400"
                              aria-label={`Navigate to ${
                                place.tags
                                  ?.name ||
                                "location"
                              }`}
                            >
                              <Navigation2 className="h-3.5 w-3.5" />
                            </a>

                          </div>

                        </Card>
                      );
                    }
                  )}

              </div>
            )}

        </div>

      </div>

    </div>
  );
};

export default LiveMap;